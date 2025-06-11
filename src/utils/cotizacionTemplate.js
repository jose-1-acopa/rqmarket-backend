const fs = require("fs");
const path = require("path");
const numalet = require("numalet");

const numeroALetras = numalet({
  plural: "PESOS",
  singular: "PESO",
  centPlural: "CENTAVOS",
  centSingular: "CENTAVO",
});

function generarCotizacionPDF(data) {
  // Calcular partidas con margen aplicado
  const partidas = data.partidas.map((item, index) => {
    const margen = data.margen || 0; // Asegúrate de enviar `margen` en el body del PDF
    const precioFinal = item.precio_unitario * (1 + margen / 100);
    const importe = item.cantidad * precioFinal;

    return [
      { text: index + 1, alignment: "center" },
      item.cantidad,
      item.unidad,
      item.descripcion,
      { text: `$${precioFinal.toFixed(2)}`, alignment: "right" },
      { text: `$${importe.toFixed(2)}`, alignment: "right" }
    ];
  });

  // Recalcular totales con precio con margen
  const subtotal = data.partidas.reduce((acc, p) => {
    const precioFinal = p.precio_unitario * (1 + (data.margen || 0) / 100);
    return acc + p.cantidad * precioFinal;
  }, 0);

  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const totalEnLetra = numeroALetras(total.toFixed(2));

  const logoPath = path.join(__dirname, "../assets/logo.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");

  return {
    content: [
      {
        columns: [
          { image: `data:image/png;base64,${logoBase64}`, width: 120 },
          {
            stack: [
              { text: `Cotización: ${data.folio}`, alignment: "right" },
              { text: `Fecha: ${data.fecha}`, alignment: "right" },
              { text: `Cliente: ${data.cliente.nombre}`, alignment: "right" },
              { text: `Empresa: ${data.cliente.empresa}`, alignment: "right" },
              { text: `Correo: ${data.cliente.correo}`, alignment: "right" }
            ]
          }
        ]
      },
      { text: `\nProducto solicitado: ${data.producto}`, margin: [0, 5] },
      { text: "\nPartidas", style: "subheader" },
      {
        table: {
          headerRows: 1,
          widths: [20, 40, 40, "*", 60, 60],
          body: [
            [
              { text: "#", style: "tableHeader" },
              { text: "Cantidad", style: "tableHeader" },
              { text: "Unidad", style: "tableHeader" },
              { text: "Descripción", style: "tableHeader" },
              { text: "Precio Unitario", style: "tableHeader" },
              { text: "Importe", style: "tableHeader" }
            ],
            ...partidas
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 10]
      },
      {
        columns: [
          { text: "" },
          {
            table: {
              widths: ["*", "auto"],
              body: [
                ["Subtotal", `$${subtotal.toFixed(2)}`],
                ["IVA (16%)", `$${iva.toFixed(2)}`],
                [{ text: "Total", bold: true }, { text: `$${total.toFixed(2)}`, bold: true }]
              ]
            },
            layout: "noBorders",
            alignment: "right"
          }
        ]
      },
      { text: `\nImporte en letra: ${totalEnLetra}`, italics: true, margin: [0, 5] },
      { text: `\nCondiciones comerciales:\n${data.condiciones_comerciales}`, margin: [0, 5] },
      { text: `\nTiempo estimado de entrega: ${data.tiempo_entrega}`, margin: [0, 5] },
      {
        text: `\nDatos bancarios:\n${data.datos_bancarios.empresa}\n${data.datos_bancarios.banco}\nCuenta: ${data.datos_bancarios.cuenta}\nCLABE: ${data.datos_bancarios.clabe}`,
        margin: [0, 10]
      },
      {
        text: `\nATENTAMENTE\n${data.representante}`,
        alignment: "center",
        margin: [0, 30, 0, 0],
        style: "firma"
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true, decoration: "underline" },
      tableHeader: { bold: true, fillColor: "#eeeeee" },
      firma: { fontSize: 12 }
    },
    defaultStyle: { font: "Roboto" },
    pageMargins: [40, 60, 40, 60]
  };
}

module.exports = generarCotizacionPDF;
