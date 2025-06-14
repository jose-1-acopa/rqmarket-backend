// src/utils/openaiStream.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ Necesario para frontend
});

export async function generarTextoIA(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const texto = response.choices[0].message?.content;
    return texto || "No se generó contenido.";
  } catch (error) {
    console.error("Error al conectar con OpenAI:", error);
    return "Error al generar contenido con IA.";
  }
}
