// src/firebase/firebaseServices.ts
import { db, storage } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function guardarRQCompleta(formulario: any) {
  try {
    let archivoURL = "";

    // Solo sube el archivo si existe
    if (formulario.archivo) {
      const archivoRef = ref(storage, `rq-completo/${formulario.archivo.name}`);
      await uploadBytes(archivoRef, formulario.archivo);
      archivoURL = await getDownloadURL(archivoRef);
    }

    // Guardar info en Firestore
    await addDoc(collection(db, "requisiciones_completas"), {
      nombre: formulario.nombre || "",
      empresa: formulario.empresa || "",
      email: formulario.email || "",
      descripcion: formulario.descripcion || "",
      producto: formulario.producto || "",
      marca: formulario.marca || "",
      modelo: formulario.modelo || "",
      cantidad: formulario.cantidad || "",
      unidad: formulario.unidad || "",
      ubicacion: formulario.ubicacion || "",
      proveedorPreferido: formulario.proveedorPreferido || "",
      tiempoEntrega: formulario.tiempoEntrega || "",
      presupuesto: formulario.presupuesto || "",
      detalles: formulario.detalles || "",
      archivoURL, // puede estar vacío si no se adjuntó archivo
      fecha: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error al guardar la RQ:", error);
    return { success: false, error };
  }
}
