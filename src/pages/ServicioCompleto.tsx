import React, { useState } from "react";
import "./ServicioCompleto.css";
import { guardarRQCompleta } from "../firebase/firebaseServices";

export default function ServicioCompleto() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    empresa: "",
    producto: "",
    marca: "",
    modelo: "",
    cantidad: "",
    unidad: "",
    proveedorPreferido: "",
    tiempoEntrega: "",
    presupuesto: "",
    detalles: "",
    archivo: null as File | null,
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje("");

    const result = await guardarRQCompleta(form);
    setEnviando(false);

    if (result.success) {
      setMensaje("✅ Tu requisición fue enviada correctamente.");
      setForm({
        nombre: "",
        telefono: "",
        email: "",
        empresa: "",
        producto: "",
        marca: "",
        modelo: "",
        cantidad: "",
        unidad: "",
        proveedorPreferido: "",
        tiempoEntrega: "",
        presupuesto: "",
        detalles: "",
        archivo: null,
      });
    } else {
      setMensaje("❌ Ocurrió un error al enviar la requisición.");
    }
  };

  return (
    <section className="servicio-completo-container">
      <div className="servicio-completo-box">
        <div className="servicio-completo-intro">
          <h1>Gestión completa de compras</h1>
          <p>
            Este modelo está diseñado para empresas que desean delegar todo el proceso de compras:
            desde la cotización hasta la entrega. Sube tu requisición y nuestro equipo se encarga de lo demás.
          </p>
        </div>

        <form className="servicio-completo-form" onSubmit={handleSubmit}>
          <h2>Sube tu requisición</h2>

          <div className="form-group">
            <label>Nombre completo:</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Teléfono:</label>
            <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Correo electrónico:</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Empresa:</label>
            <input type="text" name="empresa" value={form.empresa} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Producto o servicio (sin ciudad ni estado):</label>
            <input type="text" name="producto" value={form.producto} onChange={handleChange} required />
            <small>Por favor, no escribas ubicación aquí. Eso se indica en el campo de entrega.</small>
          </div>

          <div className="form-group">
            <label>Marca sugerida:</label>
            <input type="text" name="marca" value={form.marca} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Modelo o referencia técnica:</label>
            <input type="text" name="modelo" value={form.modelo} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Cantidad:</label>
            <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Unidad de medida:</label>
            <select name="unidad" value={form.unidad} onChange={handleChange} required>
              <option value="">Seleccione una opción</option>
              <option value="pieza">Pieza</option>
              <option value="caja">Caja</option>
              <option value="kg">Kilogramo</option>
              <option value="litro">Litro</option>
              <option value="metro">Metro</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de proveedor preferido:</label>
            <select name="proveedorPreferido" value={form.proveedorPreferido} onChange={handleChange}>
              <option value="">Cualquiera</option>
              <option value="fabricante">Fabricante</option>
              <option value="distribuidor">Distribuidor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tiempo máximo de entrega esperado (días):</label>
            <input type="number" name="tiempoEntrega" value={form.tiempoEntrega} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Presupuesto estimado por unidad (opcional):</label>
            <input
              type="number"
              name="presupuesto"
              step="0.01"
              min="0"
              value={form.presupuesto}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Detalles adicionales:</label>
            <textarea name="detalles" value={form.detalles} onChange={handleChange} rows={4}></textarea>
          </div>

          <div className="form-group">
            <label>Adjuntar archivo (opcional):</label>
            <input type="file" name="archivo" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleChange} />
          </div>

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar requisición"}
          </button>
        </form>

        {mensaje && <p className="mensaje-envio">{mensaje}</p>}

        <div className="servicio-completo-info">
          <h3>¿Qué sucede después?</h3>
          <ul>
            <li>🔍 Cotizamos con múltiples proveedores.</li>
            <li>📊 Seleccionamos la mejor propuesta.</li>
            <li>🛒 Compramos y gestionamos la entrega.</li>
            <li>📦 Tú recibes el producto sin complicaciones.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
