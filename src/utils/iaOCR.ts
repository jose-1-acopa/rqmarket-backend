// src/utils/iaOCR.ts
export async function generarPropuestaOCR(producto: string) {
    const response = await fetch("http://localhost:5000/api/generar-propuesta-operador", {
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
  