const express = require('express');
const router = express.Router();
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ✅ Cargar fuentes desde la carpeta correcta
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Bold.ttf'),
    italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/Roboto-Medium.ttf')
  }
};

const printer = new PdfPrinter(fonts);

// ✅ Importar la plantilla profesional
const generarCotizacionPDF = require('../utils/cotizacionTemplate');

// 🔧 Ruta corregida (sin duplicar /api)
router.post('/generar-cotizacion-pdf', async (req, res) => {
  try {
    const data = req.body;
    console.log("📥 Recibido en /generar-cotizacion-pdf:", data);

    if (!data.cliente || !data.producto || !data.partidas || data.partidas.length === 0) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para generar la cotización.' });
    }

    // Generar docDefinition con los datos recibidos
    const docDefinition = await generarCotizacionPDF(data);

    const fileName = `cotizacion_${uuidv4()}.pdf`;
    const filePath = path.join(__dirname, '../pdfs', fileName);

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();

    pdfDoc.on('end', () => {
      console.log("✅ PDF generado:", fileName);
      res.json({ success: true, file: `/pdfs/${fileName}` });
    });

    pdfDoc.on('error', (err) => {
      console.error("❌ Error al generar el PDF:", err);
      res.status(500).json({ success: false, message: 'Error al generar el documento PDF.' });
    });

  } catch (error) {
    console.error("❌ Error general en PDF router:", error);
    res.status(500).json({ success: false, message: 'Error generando el PDF' });
  }
});

module.exports = router;
