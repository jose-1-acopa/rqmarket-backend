/**
 * AuthContext.tsx
 *
 * Contexto de autenticación de toda la app.
 *
 * Mantiene el estado del usuario logueado y expone funciones para:
 *   - loginConGoogle()
 *   - loginConEmail(email, password)
 *   - registrarConEmail(email, password, nombre)
 *   - logout()
 *   - getIdToken()  → para mandar al backend
 *
 * Uso en cualquier componente:
 *   const { usuario, esAdmin, loginConGoogle, logout } = useAuth();
 *
 * Detalles importantes:
 *   - Cuando un usuario hace login por PRIMERA vez, se crea automáticamente
 *     un documento en la colección "usuarios" de Firestore con rol "comprador".
 *   - Si ese documento ya existe, leemos su rol (puede ser "admin" o "proveedor").
 *   - El token JWT se obtiene con getIdToken() y se debe mandar al backend
 *     en el header: Authorization: Bearer <token>
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

// ── Tipos ────────────────────────────────────────────────────────────

export type RolUsuario = "comprador" | "proveedor" | "admin";

// Rol DENTRO de una organización (plan Empresa, Fase D). Distinto del `rol`
// global de plataforma. PyME no tiene org_rol (null).
export type RolOrg = "admin" | "compras" | "ventas";

export interface UsuarioApp {
  uid: string;
  email: string | null;
  nombre: string | null;
  rol: RolUsuario;
  empresa?: string;
  // Organización (solo plan Empresa). PyME deja estos en null.
  org_id?: string | null;
  org_rol?: RolOrg | null;
  // Plan resuelto user-or-org ('pyme' | 'empresa' | null).
  plan_tipo?: "pyme" | "empresa" | null;
}

interface AuthContextType {
  // Estado
  usuario: UsuarioApp | null;
  cargando: boolean;
  esAdmin: boolean;
  estaAutenticado: boolean;

  // Organización (Fase D). Para PyME: orgId/orgRol = null y los `puede*` = true.
  orgId: string | null;
  orgRol: RolOrg | null;
  planTipo: "pyme" | "empresa" | null;
  esAdminOrg: boolean;
  puedeComprar: boolean; // publicar RFQ, ver cotizaciones, desbloquear contacto
  puedeVender: boolean;  // cotizar, gestionar perfil de proveedor

  // Acciones
  loginConGoogle: () => Promise<void>;
  loginConEmail: (email: string, password: string) => Promise<void>;
  registrarConEmail: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;

  // Para llamadas al backend
  getIdToken: () => Promise<string | null>;
}

// ── Contexto ─────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Cuando un usuario inicia sesión por primera vez, creamos su documento
 * en la colección "usuarios" de Firestore. Si ya existe, leemos su rol.
 */
async function asegurarDocumentoUsuario(fbUser: User): Promise<UsuarioApp> {
  const userRef = doc(db, "usuarios", fbUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    const orgId = data.org_id ?? null;
    const orgRol = (data.org_rol as RolOrg) ?? null;

    // plan_tipo resuelto user-or-org: si el usuario no tiene suscripción propia
    // pero pertenece a una org (Empresa), tomamos el plan de la org.
    let planTipo: "pyme" | "empresa" | null = data.suscripcion?.plan_tipo ?? null;
    if (!planTipo && orgId) {
      try {
        const orgSnap = await getDoc(doc(db, "organizaciones", orgId));
        if (orgSnap.exists()) {
          const o = orgSnap.data();
          planTipo = o.suscripcion?.plan_tipo ?? o.plan_tipo ?? null;
        }
      } catch (err) {
        console.warn("No se pudo leer la organización del usuario:", err);
      }
    }

    return {
      uid: fbUser.uid,
      email: fbUser.email,
      nombre: data.nombre || fbUser.displayName,
      rol: data.rol || "comprador",
      empresa: data.empresa,
      org_id: orgId,
      org_rol: orgRol,
      plan_tipo: planTipo,
    };
  }

  // Primera vez: crear el documento como comprador por defecto
  const nuevoUsuario = {
    email: fbUser.email,
    nombre: fbUser.displayName || "",
    empresa: "",
    rol: "comprador" as RolUsuario,
    plan_activo: null,
    contactos_desbloqueados_mes: 0,
    stripe_customer_id: null,
    creado_en: serverTimestamp(),
  };

  await setDoc(userRef, nuevoUsuario);

  return {
    uid: fbUser.uid,
    email: fbUser.email,
    nombre: nuevoUsuario.nombre,
    rol: "comprador",
    empresa: "",
  };
}

// ── Provider ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioApp | null>(null);
  const [cargando, setCargando] = useState(true);

  // Escuchar cambios de auth de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Mientras resolvemos el doc del usuario (round-trip a Firestore),
        // mantenemos `cargando=true` para que los guards de páginas protegidas
        // esperen en vez de rebotar a /login durante esa ventana.
        setCargando(true);
        try {
          const userApp = await asegurarDocumentoUsuario(fbUser);
          setUsuario(userApp);
        } catch (err) {
          console.error("Error cargando datos del usuario:", err);
          // Fallback: armar usuario mínimo
          setUsuario({
            uid: fbUser.uid,
            email: fbUser.email,
            nombre: fbUser.displayName,
            rol: "comprador",
          });
        }
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Acciones ────────────────────────────────────────────────────

  const loginConGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // El onAuthStateChanged ya se encarga de actualizar el estado
  };

  const loginConEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registrarConEmail = async (email: string, password: string, nombre: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user && nombre) {
      await updateProfile(credential.user, { displayName: nombre });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  // ── Valor del contexto ──────────────────────────────────────────

  const orgRol = usuario?.org_rol ?? null;

  const value: AuthContextType = {
    usuario,
    cargando,
    esAdmin: usuario?.rol === "admin",
    estaAutenticado: !!usuario,
    // Organización (Fase D). PyME (sin orgRol) → acceso total a su scope.
    orgId: usuario?.org_id ?? null,
    orgRol,
    planTipo: usuario?.plan_tipo ?? null,
    esAdminOrg: orgRol === "admin",
    puedeComprar: !orgRol || orgRol === "admin" || orgRol === "compras",
    puedeVender: !orgRol || orgRol === "admin" || orgRol === "ventas",
    loginConGoogle,
    loginConEmail,
    registrarConEmail,
    logout,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
