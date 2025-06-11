// src/utils/limiteRQ.ts
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// ✅ Esta función calcula el límite según el plan
export function obtenerLimiteRQ(plan: string | null): number {
  switch (plan) {
    case "basico":
      return 6;
    case "empresarial":
      return 25;
    case "corporativo":
      return Infinity;
    default:
      return 0;
  }
}

// ✅ Esta función cuenta las RQ enviadas por el usuario en el mes actual
export async function obtenerRQDelMes(uid: string) {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioISO = inicioMes.toISOString();

  const ref = collection(db, "requisiciones");
  const q = query(ref, where("uid", "==", uid), where("fecha", ">=", inicioISO));
  const snapshot = await getDocs(q);

  return snapshot.size;
}
