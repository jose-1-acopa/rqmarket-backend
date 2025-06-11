import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "./AdminRequisiciones.css";

export default function AdminRequisiciones() {
  const [requisiciones, setRequisiciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [requisicionSeleccionada, setRequisicionSeleccionada] = useState<any>(null);

  const [producto, setProducto] = useState("");
  const [precioBase, setPrecioBase] = useState(0);
  const [margen, setMargen] = useState(21);
  const [precioFinal, setPrecioFinal] = useState(0);
  const [tiempo, setTiempo] = useState("3 a 5 días hábiles");
  const [condiciones, setCondiciones] = useState("Pago contra entrega. Precios + IVA.");
  const [propuestaTexto, setPropuestaTexto] = useState("");

  useEffect(() => {
    const obtenerRequisiciones = async () => {
      try {
        const snapshot = await getDocs(collection(db, "requisiciones_completas"));
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequisiciones(lista);
      } catch (error) {
        console.error("Error al cargar requisiciones:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerRequisiciones();
  }, []);

  useEffect(() => {
    const calculado = precioBase * (1 + margen / 100);
    setPrecioFinal(Number(calculado.toFixed(2)));
  }, [precioBase, margen]);

  const abrirModal = async (rq: any) => {
    setRequisicionSeleccionada(rq);
    const productoActual = rq.producto || rq.descripcion || "";
    setProducto(productoActual);
    setPrecioBase(0);
    setPropuestaTexto("");
    setTimeout(() => setModalAbierto(true), 100);

    try {
      const response = await fetch("http://localhost:5000/api/generar-propuesta-operador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto: productoActual })
      });
      const data = await response.json();
      setPropuestaTexto(data.propuesta || "Sin propuesta generada.");
    } catch (error) {
      console.error("❌ Error al obtener propuesta:", error);
      setPropuestaTexto("Ocurrió un error al generar la propuesta.");
    }
  };

  const generarPDFBackend = async () => {
    if (!requisicionSeleccionada) return;
    if (!producto || precioBase <= 0) {
      alert("Por favor ingresa un producto y un precio válido.");
      return;
    }

    const payload = {
      folio: `RQ${Date.now()}`,
      fecha: new Date().toLocaleDateString(),
      cliente: {
        nombre: requisicionSeleccionada.nombre,
        empresa: requisicionSeleccionada.empresa,
        correo: requisicionSeleccionada.email,
      },
      producto,
      condiciones_comerciales: condiciones,
      tiempo_entrega: tiempo,
      datos_bancarios: {
        empresa: "RQ MARKET S.A. DE C.V.",
        banco: "BANORTE",
        cuenta: "1234567890",
        clabe: "123456789012345678",
      },
      representante: "JOSÉ ACOPA",
      partidas: [
        {
          cantidad: requisicionSeleccionada.cantidad || 1,
          unidad: requisicionSeleccionada.unidad || "pieza",
          descripcion: producto,
          precio_unitario: precioFinal, // ✅ corregido: usamos el precioFinal con margen
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:5000/api/generar-cotizacion-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success && result.file) {
        window.open("http://localhost:5000" + result.file, "_blank");
      } else {
        alert("Error al generar cotización.");
        console.error("❌ Detalle del error:", result.message || "Error desconocido");
      }
    } catch (error) {
      console.error("Error en la generación del PDF:", error);
      alert("No se pudo generar el PDF.");
    }
  };

  return (
    <section className="admin-requisiciones-container">
      <h1>Panel de Requisiciones Recibidas</h1>
      {cargando ? (
        <p>Cargando requisiciones...</p>
      ) : (
        <table className="tabla-requisiciones">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Empresa</th>
              <th>Correo</th>
              <th>Producto</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Ubicación</th>
              <th>Archivo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {requisiciones.map((rq) => (
              <tr key={rq.id}>
                <td>{rq.nombre}</td>
                <td>{rq.empresa}</td>
                <td>{rq.email}</td>
                <td>{rq.producto || rq.descripcion}</td>
                <td>{rq.marca || "-"}</td>
                <td>{rq.modelo || "-"}</td>
                <td>{rq.ubicacion || "-"}</td>
                <td>
                  {rq.archivoURL ? (
                    <a href={rq.archivoURL} target="_blank" rel="noreferrer">Ver archivo</a>
                  ) : (
                    "Sin archivo"
                  )}
                </td>
                <td>
                  <button className="btn-generar" onClick={() => abrirModal(rq)}>
                    Generar propuesta con IA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalAbierto && requisicionSeleccionada && (
        <div className="modal-propuesta">
          <div className="modal-contenido" id="propuesta-pdf">
            <header className="encabezado-pdf">
              <img src="/logo-rqmarket.png" alt="RQ MARKET" height="70" />
              <div>
                <h2>Propuesta de Cotización</h2>
                <p>Fecha: {new Date().toLocaleDateString()}</p>
                <p>Cliente: {requisicionSeleccionada?.nombre}</p>
                <p>Empresa: {requisicionSeleccionada?.empresa}</p>
                <p>Correo: {requisicionSeleccionada?.email}</p>
                <p>Producto solicitado: {producto}</p>
              </div>
            </header>
            <hr />
            <section className="mi-cotizacion-box">
              <h3>Mi cotización personalizada:</h3>
              <div className="form-grid">
                <div>
                  <label>Precio base:</label>
                  <input type="number" value={precioBase} onChange={(e) => setPrecioBase(Number(e.target.value))} />
                </div>
                <div>
                  <label>% Margen:</label>
                  <input type="number" value={margen} onChange={(e) => setMargen(Number(e.target.value))} />
                </div>
              </div>
              <p>💰 <strong>Precio final:</strong> ${precioFinal.toFixed(2)} MXN</p>
              <div>
                <label>📦 Tiempo estimado de entrega:</label>
                <input type="text" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
              </div>
              <div>
                <label>📄 Condiciones comerciales:</label>
                <textarea value={condiciones} onChange={(e) => setCondiciones(e.target.value)} />
              </div>
            </section>

            <section className="resumen-proveedores-box">
              <h3>📌 Resultado de la IA desde Google Maps:</h3>
              <pre className="propuesta-texto">{propuestaTexto}</pre>
            </section>

            <footer className="pie-pdf">
              <p>Gracias por confiar en RQ MARKET</p>
              <p>www.rqmarket.com | contacto@rqmarket.com</p>
            </footer>
          </div>

          <div className="acciones-modal">
            <button className="btn-generar" onClick={generarPDFBackend}>Generar cotización RQ MARKET</button>
            <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </section>
  );
}
