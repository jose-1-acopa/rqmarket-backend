// src/utils/serpSearch.ts

// 🔗 Tomar la URL base del backend desde .env
const API = import.meta.env.VITE_BACKEND_URL;

export async function buscarEnGoogle(query: string) {
  if (!API) {
    console.warn("⚠️ VITE_BACKEND_URL no está definido en el archivo .env");
    throw new Error("Configuración de backend no encontrada");
  }

  try {
    const response = await fetch(`${API}/api/serpapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error backend SerpAPI:", errorText);
      throw new Error("Error en búsqueda con SerpAPI");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al buscar en backend (SerpAPI):", error);
    return null;
  }
}
