const Tesseract = require('tesseract.js');
const path = require('path');

const imagen = path.resolve(__dirname, 'captura-final.png');

console.log('🧠 Leyendo texto desde captura-final.png...');

Tesseract.recognize(
  imagen,
  'spa', // OCR en español
  {
    logger: m => console.log(m) // muestra progreso
  }
).then(({ data: { text } }) => {
  console.log('\n✅ TEXTO DETECTADO:\n');
  console.log(text);
}).catch(err => {
  console.error('❌ Error al procesar la imagen:', err);
});
