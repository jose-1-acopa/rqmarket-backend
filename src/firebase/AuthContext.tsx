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

export interface UsuarioApp {
  uid: string;
  email: string | null;
  nombre: string | null;
  rol: RolUsuario;
  empresa?: string;
}

interface AuthContextType {
  // Estado
  usuario: UsuarioApp | null;
  cargando: boolean;
  esAdmin: boolean;
  estaAutenticado: boolean;

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
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      nombre: data.nombre || fbUser.displayName,
      rol: data.rol || "comprador",
      empresa: data.empresa,
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

  const value: AuthContextType = {
    usuario,
    cargando,
    esAdmin: usuario?.rol === "admin",
    estaAutenticado: !!usuario,
    loginConGoogle,
    loginConEmail,
    registrarConEmail,
    logout,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
