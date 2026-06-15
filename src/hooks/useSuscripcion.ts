/**
 * useSuscripcion — lee la suscripción del usuario de forma ORG-AWARE (Fase D).
 *
 *   - PyME / legacy: suscripción en usuarios/{uid}.suscripcion (como siempre).
 *   - Empresa: la suscripción vive en organizaciones/{org_id}.suscripcion; este
 *     hook detecta el org_id del usuario y se suscribe al doc de la org.
 *
 * Devuelve la suscripción resuelta en tiempo real (onSnapshot), más
 * `empresaTemprana` (programa Primeras 100) leído del doc del usuario.
 */

import { useEffect, useState } from "react";
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/AuthContext";
import type { FirestoreTimestamp } from "../services/rqmarketApi";

export type EstadoSuscripcion =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | string;

export interface SuscripcionData {
  activa?: boolean;
  plan_tipo?: "pyme" | "empresa" | null;
  facturacion?: "mensual" | "anual" | null;
  stripe_subscription_id?: string;
  price_id?: string | null;
  fecha_inicio?: FirestoreTimestamp | null;
  fecha_proximo_cobro?: FirestoreTimestamp | null;
  estado?: EstadoSuscripcion;
  actualizado_en?: FirestoreTimestamp | null;
}

export interface UseSuscripcionResult {
  suscripcion: SuscripcionData | null;
  empresaTemprana: boolean;
  cargando: boolean;
  error: string | null;
}

export function useSuscripcion(): UseSuscripcionResult {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [suscripcion, setSuscripcion] = useState<SuscripcionData | null>(null);
  const [empresaTemprana, setEmpresaTemprana] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!usuario) {
      setSuscripcion(null);
      setEmpresaTemprana(false);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    let unsubOrg: Unsubscribe = () => {};
    let orgActual: string | null = null;

    const unsubUser = onSnapshot(
      doc(db, "usuarios", usuario.uid),
      (snap) => {
        const data = snap.exists() ? (snap.data() as any) : {};
        setEmpresaTemprana(!!data.empresa_temprana);

        const orgId: string | null = data.org_id ?? null;
        if (orgId) {
          // Empresa: la suscripción vive en la org. Suscribirse a su doc.
          if (orgId !== orgActual) {
            orgActual = orgId;
            unsubOrg();
            unsubOrg = onSnapshot(
              doc(db, "organizaciones", orgId),
              (oSnap) => {
                setSuscripcion(oSnap.exists() ? (oSnap.data() as any).suscripcion || null : null);
                setCargando(false);
              },
              (err) => {
                console.error("Error en onSnapshot organización:", err);
                setError(err?.message || "No se pudo cargar la suscripción de la organización");
                setCargando(false);
              }
            );
          }
        } else {
          // PyME: suscripción en el propio doc del usuario.
          orgActual = null;
          unsubOrg();
          unsubOrg = () => {};
          setSuscripcion(data.suscripcion || null);
          setCargando(false);
        }
      },
      (err) => {
        console.error("Error en onSnapshot usuario:", err);
        setError(err?.message || "No se pudo cargar tu suscripción");
        setCargando(false);
      }
    );

    return () => {
      unsubUser();
      unsubOrg();
    };
  }, [usuario, cargandoAuth]);

  return { suscripcion, empresaTemprana, cargando, error };
}
