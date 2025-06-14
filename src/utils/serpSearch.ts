// src/utils/serpSearch.ts
export async function buscarEnGoogle(query: string) {
  try {
    const response = await fetch("https://rqmarket-backend.onrender.com/api/serpapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al buscar en backend (SerpAPI):", error);
    return null;
  }
}
