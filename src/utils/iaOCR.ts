// src/utils/iaOCR.ts

// 🔗 Tomar la URL base del backend desde .env
const API = import.meta.env.VITE_BACKEND_URL;

export async function generarPropuestaOCR(producto: string) {
  if (!API) {
    console.warn("⚠️ VITE_BACKEND_URL no está definido en el archivo .env");
    throw new Error("Configuración de backend no encontrada");
  }

  const response = await fetch(`${API}/api/generar-propuesta-operador`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ producto })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Error backend OCR:", errorText);
    throw new Error("Error al generar propuesta con OCR");
  }

  const data = await response.json();
  return data.propuesta;
}
