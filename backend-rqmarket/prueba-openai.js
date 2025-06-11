require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `
      Lee este texto como si fueras un experto en compras:
      
      [Fabrica de tambos

5.0 AAA (1)

Empresa de fabricación de plástico - C. Cam. a Indicaciones
la Mina MZ 064

Local Tambos y Botes de Plástico

3.5 kKAH-+ (6)

Comercio - Eje 3 Nte. Camarones 62a Indicaciones
Cerrado - Abre a las 9%a.m. del sáb -

55 53412075

Entrega a domicilio

Tanques Tambos Y Cubetas S

De RI De Cv (e)

4.1 Aka (20) Sitio web Indicaciones
Fábrica - Obsidiana 5263

Cerrado - Abre a las 8a.m. del sáb -

664 634 8159

p—i o
INDUSTRIAL DE ENVASES
ULLOA (e)

5.0 LAA (5) Sitio web Indicaciones
Fábrica - ái - C. Lago de Pátzcuaro

32

Cerrado - Abre a las 8:30 a.m. del

lun - 55 5769 9112

Y "Buen lugar y un muy buen servicio 6"

COMPRA VENTA de tambores de 200

litros y demas porrones

1.0 * (1) Indicaciones
Comercio - Sur 75-A 343

Cerrado - Abre a las 9%a.m. del sáb -

55 6843 O770

Entrega a domicilio

Tambos y totes García

4.3 XK HKA+4 (30)

Fábrica - Carr. Querétaro - Chichimequillas Indicaciones

Ci o
Tambos y totes García
4.3 XK HKA+4 (30)

Fábrica - Carr. Querétaro - Chichimequillas Indicaciones
Cerrado - Abre a las 8a.m. del sáb -
442 147 0610
e "Tienen de todo en contenedor de agua.buenos
precio atención recomendable"
Tambores Roberto Peña
5.0 AAA (1)
Empresa de embalaje - Av Fidel Velázquez Indicaciones
1574-A
Cerrado - Abre a las 9%a.m. del sáb -
818371 5166
Tambos y Garragones
4.3 KK KA (7)
Centro de reciclaje de latas y botellas - Eje 6 Indicaciones
Sur Esquina montes de Oca 9 sn
ÍA NRuanos producto y nracinc"
Tambos y cubetas 27km
5.0 AAA (1)
Carretera mex.tex, Carr. Federal México- Indicaciones
Texcoco Km27-km 27
Cerrado - Abre a las 9%a.m. del sáb -
55 7442 9965
Tambos la estrella
5.0 AAA (3)
Av. Oyamel 72 Indicaciones
Cerrado - Abre a las 10 a.m. del sáb
Tambos el Zorro
4.3 XK KA (34)
Mayorista - 91777 Prolongacion, C. J. B. Lobos Indicaciones
lote 16
Cierra pronto - 7 p.m. - Abre a las 8a.m. del sáb
- 229 939 8927
Y "Entre 19 ly 200 litros;"

—SU CA —
Empresa de fabricación de plástico - Carretera Indicaciones
Apizaco-Tlaixco Km 3.3
Cierra pronto - 7:30 p.m. - Abre a las 7 a.m. del
sáb
iPLASTICOS
4.6 dk AAA (18) (0)

Empresa de moldeo por inyección — sitio web Indicaciones

de plástico - Calle Ferretería 4

Cerrado - Abre a las 9%a.m. del sáb -

55 5702 6106

Tambos ,cubetas y bidones

5.0 AAA (1)

50266 Indicaciones

Abierto - Cierra a las 7 a.m. del sáb -

722 716 7665

e "Muy buena atencion y buenos precios tanto en
tambos ,herrería y muebles"

_—
iPLASTICOS
4.6 dk AAA (18) (0)

Empresa de moldeo por inyección — sitio web Indicaciones

de plástico - Calle Ferretería 4

Cerrado - Abre a las 9%a.m. del sáb -

55 5702 6106

Tambos ,cubetas y bidones

5.0 AAA (1)

50266 Indicaciones

Abierto - Cierra a las 7 a.m. del sáb -

722 716 7665

e "Muy buena atencion y buenos precios tanto en
tambos ,herrería y muebles"

Compra-Venta de costales,

barcinas,botes, tambos.

4.3 KK (1 NA Indicaciones

Almacén - Pte7. T Volver al principio

Cerrado - Abre a las 8a.m. del sáb -]
      
      Ahora extrae los datos importantes de cada negocio, como nombre, tipo (fabricante, distribuidor, etc), teléfono, calificación, y redacta una propuesta profesional como si yo fuera un comprador. Debes elegir a los 3 proveedores más relevantes para la compra de tambores de 200 litros y justificar por qué.
      `
        }
      ],      
    });

    console.log("✅ RESPUESTA:", res.choices[0].message.content);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
})();
