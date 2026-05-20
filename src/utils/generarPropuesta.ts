import OpenAI from "openai";

// ⚠️ No instanciamos aquí directamente el cliente para evitar errores en tiempo de build
export async function generarPropuesta(
  producto: string,
  cantidad: string,
  detalles: string
): Promise<string> {
  const prompt = `Eres un proveedor especializado. Genera una propuesta profesional en formato de cotización con base en los siguientes requerimientos:
- Producto: ${producto}
- Cantidad: ${cantidad}
- Detalles: ${detalles}

Incluye:
- Tres opciones de proveedores imaginarios
- Características del producto
- Tiempo estimado de entrega
- Precio estimado

El resultado debe parecer una propuesta real enviada por un proveedor.`;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
    });

    return completion.choices?.[0]?.message?.content || "⚠️ Propuesta no generada.";
  } catch (error: any) {
    console.error("❌ Error generando propuesta IA:", error?.response?.data || error.message);
    return "❌ Error al generar propuesta inteligente.";
  }
}
