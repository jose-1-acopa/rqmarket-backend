const puppeteer = require("puppeteer");
const sharp = require("sharp");
const fs = require("fs");
const Tesseract = require("tesseract.js");

async function obtenerTextoVisual(producto) {
  console.log(`🔍 Buscando en Google Maps: ${producto}`);

  const browser = await puppeteer.launch({
    headless: "new", // Puedes poner true si ya está todo bien
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1920,1080",
      "--proxy-server='direct://'",
      "--proxy-bypass-list=*"
    ]
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.google.com/maps", { waitUntil: "networkidle2" });

    await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
    await page.type('input#searchboxinput', producto);
    await page.click('button#searchbox-searchbutton');

    console.log("⌛ Esperando resultados...");
    await new Promise(resolve => setTimeout(resolve, 7000)); // ← Aquí estaba el error

    const lista = await page.$('div[role="feed"]');
    if (!lista) {
      console.log("❌ No se encontró la columna de resultados en Maps");
      await browser.close();
      return "Sin propuesta generada.";
    }

    const bloques = [];
    const numScrolls = 5;
    for (let i = 0; i < numScrolls; i++) {
      const filename = `bloque${i}.png`;
      await lista.screenshot({ path: filename });
      bloques.push(filename);
      console.log(`📸 Captura: ${filename}`);
      await page.evaluate(el => el.scrollBy(0, 500), lista);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();

    const images = await Promise.all(bloques.map(img => sharp(img).toBuffer()));
    const metas = await Promise.all(images.map(buf => sharp(buf).metadata()));
    const totalHeight = metas.reduce((sum, m) => sum + m.height, 0);
    const width = metas[0].width;

    const composiciones = [];
    let yOffset = 0;
    for (let i = 0; i < images.length; i++) {
      composiciones.push({ input: images[i], top: yOffset, left: 0 });
      yOffset += metas[i].height;
    }

    await sharp({
      create: {
        width,
        height: totalHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite(composiciones)
      .toFile("captura-final.png");

    console.log("✅ Imagen final generada: captura-final.png");

    const { data: { text } } = await Tesseract.recognize("captura-final.png", "spa", {
      logger: m => process.stdout.write(".")
    });

    console.log("\n✅ OCR completado");
    return text;
  } catch (err) {
    console.error("❌ Error crítico durante scraping:", err);
    await browser.close();
    return "Sin propuesta generada.";
  }
}

module.exports = { obtenerTextoVisual };
