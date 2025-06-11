const puppeteer = require('puppeteer');
const fs = require('fs');
const sharp = require('sharp');

async function capturarLargoPorBloques(terminoBusqueda) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps');

  // Buscar
  await page.waitForSelector('input#searchboxinput');
  await page.type('input#searchboxinput', terminoBusqueda);
  await page.click('button#searchbox-searchbutton');

  // Esperar carga inicial
  await new Promise(resolve => setTimeout(resolve, 6000));

  const lista = await page.$('div[role="feed"]');
  if (!lista) {
    console.log('❌ No se encontró la columna');
    await browser.close();
    return;
  }

  const bloques = [];
  const numScrolls = 6;

  for (let i = 0; i < numScrolls; i++) {
    const filename = `bloque${i}.png`;
    await lista.screenshot({ path: filename });
    bloques.push(filename);
    console.log(`📸 Captura tomada: ${filename}`);

    await page.evaluate(el => el.scrollBy(0, 500), lista);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Unir imágenes verticalmente
  const images = await Promise.all(bloques.map(img => sharp(img).toBuffer()));
  const metas = await Promise.all(images.map(buf => sharp(buf).metadata()));
  const totalHeight = metas.reduce((sum, m) => sum + m.height, 0);
  const width = metas[0].width;

  let yOffset = 0;
  const composite = [];

  for (let i = 0; i < images.length; i++) {
    composite.push({ input: images[i], top: yOffset, left: 0 });
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
    .composite(composite)
    .toFile('captura-final.png');

  console.log('✅ Captura larga creada: captura-final.png');

  await browser.close();
}

capturarLargoPorBloques('fabricante de tambos 200 litros en México');
