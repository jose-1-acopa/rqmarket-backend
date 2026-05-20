// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();
const path = require("path");
const { obtenerTextoVisual } = require("./utils/scrapingVisual");

// 🔥 Firebase Admin (para guardar pagos en Firestore)
const admin = require("firebase-admin");
let firestoreReady = false;
try {
  if (!admin.apps.length) {
    // ✅ Carga el archivo JSON de la carpeta backend-rqmarket
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 no está definido en el .env");
    }
    const serviceAccountJson = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8");
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firestoreReady = true;
    console.log("✅ Firebase Admin inicializado.");
  }
} catch (e) {
  console.error("❌ Error inicializando Firebase Admin:", e);
}

const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// CORS global
app.use(cors());

// ⚠️ El webhook usa cuerpo RAW y debe montarse ANTES de express.json()
app.post(
  "/api/pay/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️  Firma de webhook inválida:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Pago completado:", {
          session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          metadata: session.metadata || {},
          payment_status: session.payment_status,
        });

        try {
          if (!firestoreReady) {
            console.warn("⚠️ Firebase no inicializado; no se guardó el pago.");
          } else {
            await admin.firestore().collection("pagos").doc(session.id).set({
              session_id: session.id,
              amount_total: session.amount_total,
              currency: session.currency,
              payment_status: session.payment_status,
              email: session.customer_email || session?.customer_details?.email || null,
              metadata: session.metadata || {},
              created: new Date(session.created * 1000),
              raw: session, // 🔥 Objeto completo Stripe
            });
            console.log("💾 Pago guardado en Firestore:", session.id);
          }
        } catch (e) {
          console.error("❌ Error guardando en Firestore:", e);
        }
        break;
      }

      default:
        console.log(`📬 Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// ⬇️ A partir de aquí JSON normal
app.use(express.json());

// ====================== RUTAS EXISTENTES ======================
app.use("/test", express.static(path.join(__dirname, "test")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

app.get("/", (req, res) => {
  res.send("🚀 Backend RQ MARKET funcionando correctamente.");
});

app.get("/health", (req, res) => res.send("ok"));

app.post("/api/generar-propuesta-operador", async (req, res) => {
  const { producto } = req.body;
  if (!producto) return res.status(400).json({ error: "Falta el producto." });

  try {
    const promptBusqueda = `Eres un comprador experto en insumos industriales. 
    Dado el siguiente producto, genera 3 frases específicas que se puedan buscar en Google Maps 
    para encontrar proveedores REALES en México. 
    Incluye fábricas, distribuidores mayoristas o empresas industriales. 
    No incluyas ubicaciones geográficas ni adjetivos como confiable o recomendado. 
    No incluyas supermercados ni tiendas minoristas.
    Producto: ${producto}`;

    const resultadoIA = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: promptBusqueda }],
        max_tokens: 150,
      }),
    });

    const dataBusqueda = await resultadoIA.json();
    const frases =
      dataBusqueda?.choices?.[0]?.message?.content
        ?.split("\n")
        .map((line) => line.replace(/^[-*\d."]+/, "").trim())
        .filter((f) => f.length > 5) || [];

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
      return res.json({
        propuesta: "No se encontraron resultados relevantes en Google Maps.",
      });
    }

    console.log("✅ Búsqueda usada:", fraseUsada);

    const promptPropuesta = `Eres un comprador profesional. 
    Analiza el siguiente texto extraído visualmente desde Google Maps 
    y extrae TODOS los proveedores RELEVANTES para el producto: "${producto}". 
    Por cada proveedor incluye:
    - Nombre
    - Teléfono (si aparece)
    - Dirección (si aparece)
    - Opinión o comentario (si aparece)
    Ignora negocios irrelevantes como tiendas de conveniencia, supermercados, florerías o negocios no relacionados.
    Texto: ${textoOCR}`;

    const respuestaIA = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: promptPropuesta }],
        max_tokens: 800,
      }),
    });

    const dataPropuesta = await respuestaIA.json();
    const propuesta =
      dataPropuesta?.choices?.[0]?.message?.content || "Sin contenido";

    return res.json({ propuesta });
  } catch (err) {
    console.error("❌ Error en propuesta-operador:", err);
    return res.status(500).json({ error: "Error al generar propuesta con OCR." });
  }
});

// 💳 Checkout (Stripe Checkout)
app.post("/api/pay/checkout", async (req, res) => {
  try {
    const { items = [], customer_email } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Debes enviar items: [{ name, unit_amount, quantity }]" });
    }

    const currency = process.env.CURRENCY || "mxn";
    const successUrl = `${process.env.BASE_URL}/pago/exito?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.BASE_URL}/pago/cancelado`;

    const line_items = items.map((it) => {
      if (!it.name || !it.unit_amount || !it.quantity) {
        throw new Error("Cada item requiere: name, unit_amount (centavos), quantity");
      }
      return {
        quantity: it.quantity,
        price_data: {
          currency,
          product_data: { name: it.name },
          unit_amount: it.unit_amount,
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: customer_email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("❌ Error creando sesión de pago:", err);
    return res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
});

app.get("/pago/exito", (req, res) => res.send("✅ Pago exitoso. ¡Gracias!"));
app.get("/pago/cancelado", (req, res) => res.send("❌ Pago cancelado. Puedes intentar nuevamente."));

const pdfRoutes = require("./routes/pdfRoutes");
app.use(pdfRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor activo en http://0.0.0.0:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("Recibí SIGTERM, cerrando…");
  process.exit(0);
});
