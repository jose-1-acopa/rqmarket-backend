// backend-rqmarket/server.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();
const path = require("path");
const { obtenerTextoVisual } = require("./utils/scrapingVisual");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Ruta raíz para Render
app.get("/", (req, res) => {
  res.send("🚀 Backend de RQ MARKET funcionando correctamente.");
});

// ✅ Servir archivos PDF
const pdfPath = path.join(__dirname, "pdfs");
app.use("/pdfs", express.static(pdfPath));

// ✅ Servir PDF de prueba en /test
app.use("/test", express.static(path.join(__dirname, "test")));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Ruta de IA que genera frases para buscar proveedores y luego los resume
app.post("/api/generar-propuesta-operador", async (req, res) => {
  const { producto } = req.body;
  if (!producto) return res.status(400).json({ error: "Falta el producto." });

  try {
    const prompt = `
Eres un comprador experto en insumos industriales. Dado el siguiente producto, genera 3 frases específicas que se puedan buscar en Google Maps para encontrar proveedores REALES en México. 
Incluye fábricas, distribuidores mayoristas o empresas industriales. 
No incluyas ubicaciones geográficas ni adjetivos como confiable o recomendado. No incluyas supermercados ni tiendas minoristas.

Producto: ${producto}
`;

    const resultadoIA = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const frases = resultadoIA.choices[0].message.content
      .split("\n")
      .map((line) => line.replace(/^[-*\d.\"]+/, "").trim())
      .filter((f) => f.length > 5);

    if (frases.length === 0) {
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

    const respuestaIA = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `
Eres un comprador profesional. Analiza el siguiente texto extraído visualmente desde Google Maps y extrae TODOS los proveedores RELEVANTES para el producto: "${producto}". 

Por cada proveedor incluye:
- Nombre
- Teléfono (si aparece)
- Dirección (si aparece)
- Opinión o comentario (si aparece)

Ignora negocios irrelevantes como tiendas de conveniencia, supermercados, florerías, o negocios no relacionados.

Texto:
${textoOCR}
`,
        },
      ],
      max_tokens: 800,
    });

    const propuesta = respuestaIA.choices[0].message.content;
    return res.json({ propuesta });

  } catch (err) {
    console.error("❌ Error en propuesta-operador:", err.message);
    return res.status(500).json({ error: "Error al generar propuesta con OCR." });
  }
});

// ✅ Rutas de generación de PDF
const pdfRoutes = require("./routes/pdfRoutes");
app.use(pdfRoutes);

// ✅ Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
