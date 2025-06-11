// src/utils/openaiStream.ts
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generarTextoIA(prompt: string): Promise<string> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const texto = response.data.choices[0].message?.content;
    return texto || "No se generó contenido.";
  } catch (error) {
    console.error("Error al conectar con OpenAI:", error);
    return "Error al generar contenido con IA.";
  }
}
