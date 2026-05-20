const fs = require("fs");
const path = require("path");
const numalet = require("numalet")(); // ✅ instanciación correcta

function generarCotizacionPDF(data) {
  const partidas = data.partidas.map((item, index) => {
    const importe = item.cantidad * item.precio_unitario;
    return [
      { text: index + 1, alignment: "center" },
      { text: item.cantidad, alignment: "center" },
      { text: item.unidad, alignment: "center" },
      { text: item.descripcion, alignment: "left" },
      { text: `$${item.precio_unitario.toFixed(2)}`, alignment: "right" },
      { text: `$${importe.toFixed(2)}`, alignment: "right" }
    ];
  });

  const subtotal = data.partidas.reduce((acc, p) => acc + p.cantidad * p.precio_unitario, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const totalEnLetra = numalet(total.toFixed(2)); // ✅ FUNCIONAL

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

      { text: `\nProducto solicitado: ${data.producto}`, margin: [0, 10, 0, 5] },

      { text: "Partidas", style: "subheader", margin: [0, 10, 0, 5] },
      {
        table: {
          headerRows: 1,
          widths: [20, 40, 40, "*", 70, 70],
          body: [
            [
              { text: "#", style: "tableHeader", alignment: "center" },
              { text: "Cantidad", style: "tableHeader", alignment: "center" },
              { text: "Unidad", style: "tableHeader", alignment: "center" },
              { text: "Descripción", style: "tableHeader" },
              { text: "Precio Unitario", style: "tableHeader", alignment: "right" },
              { text: "Importe", style: "tableHeader", alignment: "right" }
            ],
            ...partidas
          ]
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? "#f0f0f0" : null),
          hLineColor: "#444",
          vLineColor: "#ccc",
          paddingLeft: () => 5,
          paddingRight: () => 5
        },
        margin: [0, 0, 0, 10]
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
            alignment: "right",
            margin: [0, 0, 0, 10]
          }
        ]
      },

      { text: `Importe en letra: ${totalEnLetra}`, italics: true, margin: [0, 0, 0, 10] },
      { text: `Condiciones comerciales:\n${data.condiciones_comerciales}`, margin: [0, 0, 0, 10] },
      { text: `Tiempo estimado de entrega: ${data.tiempo_entrega}`, margin: [0, 0, 0, 10] },
      {
        text: `Datos bancarios:\n${data.datos_bancarios.empresa}\n${data.datos_bancarios.banco}\nCuenta: ${data.datos_bancarios.cuenta}\nCLABE: ${data.datos_bancarios.clabe}`,
        margin: [0, 0, 0, 20]
      },
      {
        text: `ATENTAMENTE\n${data.representante}`,
        alignment: "center",
        margin: [0, 30, 0, 0],
        style: "firma"
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true, decoration: "underline" },
      tableHeader: { bold: true, fillColor: "#e0e0e0" },
      firma: { fontSize: 12 }
    },
    defaultStyle: { font: "Roboto" },
    pageMargins: [40, 60, 40, 60]
  };
}

module.exports = generarCotizacionPDF;
