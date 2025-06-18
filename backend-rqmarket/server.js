// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();
const path = require("path");
const { obtenerTextoVisual } = require("./utils/scrapingVisual");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/test", express.static(path.join(__dirname, "test")));

// ✅ Servir archivos PDF
const pdfPath = path.join(__dirname, "pdfs");
app.use("/pdfs", express.static(pdfPath));

// ✅ Ruta de verificación
app.get("/", (req, res) => {
  res.send("🚀 Backend RQ MARKET funcionando correctamente.");
});

app.post("/api/generar-propuesta-operador", async (req, res) => {
  const { producto } = req.body;
  if (!producto) return res.status(400).json({ error: "Falta el producto." });

  try {
    const promptBusqueda = `
Eres un comprador experto en insumos industriales. Dado el siguiente producto, genera 3 frases específicas que se puedan buscar en Google Maps para encontrar proveedores REALES en México. 
Incluye fábricas, distribuidores mayoristas o empresas industriales. 
No incluyas ubicaciones geográficas ni adjetivos como confiable o recomendado. No incluyas supermercados ni tiendas minoristas.

Producto: ${producto}
`;

    const resultadoIA = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: promptBusqueda }],
        max_tokens: 150
      })
    });

    const dataBusqueda = await resultadoIA.json();
    const frases = dataBusqueda.choices?.[0]?.message?.content
      .split("\n")
      .map(line => line.replace(/^[-*\d."]+/, "").trim())
      .filter(f => f.length > 5);

    if (!frases || frases.length === 0) {
      return res.json({ propuesta: "No se generaron frases de búsqueda." });
    }

    let textoOCR = "";
    let fraseUsada = "";

    for (const frase of frases) {
      console.log("🔍 Probando búsqueda:", frase);
      const texto = await obtenerTextoVisual(frase);

      if (texto && texto.length > 50) {
        textoOCR = texto;
        fraseUsada = frase;
        break;
      }
    }

    if (!textoOCR) {
      return res.json({ propuesta: "No se encontraron resultados relevantes en Google Maps." });
    }

    console.log("✅ Búsqueda usada:", fraseUsada);

    const promptPropuesta = `
Eres un comprador profesional. Analiza el siguiente texto extraído visualmente desde Google Maps y extrae TODOS los proveedores RELEVANTES para el producto: "${producto}". 

Por cada proveedor incluye:
- Nombre
- Teléfono (si aparece)
- Dirección (si aparece)
- Opinión o comentario (si aparece)

Ignora negocios irrelevantes como tiendas de conveniencia, supermercados, florerías, o negocios no relacionados.

Texto:
${textoOCR}
`;

    const respuestaIA = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: promptPropuesta }],
        max_tokens: 800
      })
    });

    const dataPropuesta = await respuestaIA.json();
    const propuesta = dataPropuesta.choices?.[0]?.message?.content;
    return res.json({ propuesta });

  } catch (err) {
    console.error("❌ Error en propuesta-operador:", err);
    return res.status(500).json({ error: "Error al generar propuesta con OCR." });
  }
});

// ✅ Ruta para generación de PDFs
const pdfRoutes = require("./routes/pdfRoutes");
app.use(pdfRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
