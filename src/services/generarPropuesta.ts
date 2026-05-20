// src/services/generarPropuesta.ts
import { generarTextoIA } from "../utils/openaiStream";

export interface DatosRQ {
  producto: string;
  cantidad: string;
  detalles: string;
}

export interface ProveedorSugerido {
  nombre: string;
  descripcion: string;
  contacto: string;
  url: string;
}

export async function generarPropuestaIA(rq: DatosRQ): Promise<string> {
  const prompt = `Genera una propuesta formal para la adquisición del siguiente producto:

Producto: ${rq.producto}
Cantidad: ${rq.cantidad}
Detalles: ${rq.detalles}

Incluye:
- Breve introducción profesional
- 3 opciones de proveedor (nombres ficticios pero realistas)
- Comparación de precios y condiciones
- Cierre profesional con CTA

Formato estilo PDF empresarial, breve pero convincente.`;

  const resultado = await generarTextoIA(prompt); // ✅ uso correcto
  return resultado;
}
