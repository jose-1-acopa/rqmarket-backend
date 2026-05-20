import { motion } from "framer-motion";

const pasos = [
  {
    titulo: "1. Sube tu RQ",
    icono: "📤",
    descripcion: "El cliente envía su requisición en segundos desde la plataforma.",
  },
  {
    titulo: "2. La IA analiza",
    icono: "🤖",
    descripcion: "Nuestro sistema analiza e identifica proveedores reales con precios óptimos.",
  },
  {
    titulo: "3. Recibes propuesta",
    icono: "📄",
    descripcion: "Te entregamos un PDF con propuesta optimizada y proveedores validados.",
  },
  {
    titulo: "4. Compra segura",
    icono: "✅",
    descripcion: "Puedes comprar directamente o dejarnos que lo gestionemos por ti.",
  },
];

function ComoFunciona() {
  return (
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          ¿Cómo funciona RQ MARKET?
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {pasos.map((paso, idx) => (
            <motion.div
              key={idx}
              className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-3">{paso.icono}</div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">{paso.titulo}</h3>
              <p className="text-gray-600">{paso.descripcion}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComoFunciona;
