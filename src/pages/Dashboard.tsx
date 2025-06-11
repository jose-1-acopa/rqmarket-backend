// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  PackageCheck,
  FileText,
  FileSearch,
  AlertCircle,
  ShieldCheck,
  Users
} from "lucide-react";
import "./Dashboard.css";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { obtenerLimiteRQ, obtenerRQDelMes } from "../utils/limiteRQ";
import { generarPropuestaOCR } from "../utils/iaOCR";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const navigate = useNavigate();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [rqMesActual, setRqMesActual] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  const [formData, setFormData] = useState({
    producto: "",
    cantidad: "",
    detalles: "",
    marca: "",
    modelo: "",
    unidad: "",
    ubicacion: "",
    proveedorPreferido: "",
    tiempoEntrega: "",
    presupuesto: ""
  });

  const planesInfo: Record<string, any> = {
    basico: {
      nombre: "Plan Básico",
      beneficios: [
        { icon: <PackageCheck size={36} />, titulo: "6 RQ mensuales", desc: "Envía hasta 6 requisiciones por mes." },
        { icon: <FileSearch size={36} />, titulo: "3 propuestas por RQ", desc: "Comparativas automáticas por cada solicitud." },
        { icon: <FileText size={36} />, titulo: "Propuestas en PDF", desc: "Cotizaciones listas para descargar." },
        { icon: <AlertCircle size={36} />, titulo: "Reportes de estafadores", desc: "Acceso limitado a los últimos 10." }
      ],
      acciones: {
        subirRQ: true,
        verificarProveedor: false,
        historial: false,
        certificacion: false,
        panelMultiusuario: false,
        accesoEstafadores: true
      }
    },
    empresarial: {
      nombre: "Plan Empresarial",
      beneficios: [
        { icon: <PackageCheck size={36} />, titulo: "25 RQ mensuales", desc: "Amplio volumen mensual de requisiciones." },
        { icon: <FileSearch size={36} />, titulo: "3 búsquedas por RQ", desc: "Análisis detallado por solicitud." },
        { icon: <FileText size={36} />, titulo: "Propuestas comparativas", desc: "Mayor detalle y opciones por proveedor." },
        { icon: <AlertCircle size={36} />, titulo: "Base completa de estafadores", desc: "Acceso completo sin restricciones." },
        { icon: <ShieldCheck size={36} />, titulo: "1 verificación incluida", desc: "Evalúa la confiabilidad de un proveedor." }
      ],
      acciones: {
        subirRQ: true,
        verificarProveedor: true,
        historial: true,
        certificacion: false,
        panelMultiusuario: false,
        accesoEstafadores: true
      }
    },
    corporativo: {
      nombre: "Plan Corporativo",
      beneficios: [
        { icon: <PackageCheck size={36} />, titulo: "RQ ilimitadas", desc: "Gestión sin límite de solicitudes." },
        { icon: <FileSearch size={36} />, titulo: "Búsqueda avanzada", desc: "Conectividad total con fabricantes." },
        { icon: <ShieldCheck size={36} />, titulo: "Certificación incluida", desc: "Valida formalmente tu empresa." },
        { icon: <Users size={36} />, titulo: "Panel multiusuario", desc: "Gestiona equipos de compras." },
        { icon: <AlertCircle size={36} />, titulo: "Base completa de estafadores", desc: "Protección total antifraude." }
      ],
      acciones: {
        subirRQ: true,
        verificarProveedor: true,
        historial: true,
        certificacion: true,
        panelMultiusuario: true,
        accesoEstafadores: true
      }
    }
  };

  const limiteRQ = obtenerLimiteRQ(plan);
  const selected = plan && planesInfo[plan];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid || !plan) return;
    obtenerRQDelMes(uid).then(setRqMesActual);
  }, [uid, plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("⏳ Generando propuesta inteligente... por favor espera.");
  
    if (plan && limiteRQ !== Infinity && rqMesActual >= limiteRQ) {
      setMensaje("❌ Has alcanzado el límite de requisiciones de tu plan este mes.");
      return;
    }
  
    try {
      // ✅ 1. Genera propuesta con OCR + IA desde backend
      const propuestaIA = await generarPropuestaOCR(formData.producto);
  
      if (!propuestaIA || propuestaIA.toLowerCase().includes("error")) {
        setMensaje("❌ Ocurrió un problema al generar la propuesta.");
        return;
      }
  
      // ✅ 2. Guarda en Firebase
      const fechaActual = new Date();
const mes = fechaActual.getMonth() + 1; // Enero = 0
const anio = fechaActual.getFullYear();

await addDoc(collection(db, "requisiciones"), {
  ...formData,
  fecha: fechaActual.toISOString(),
  uid: uid || null,
  propuestaIA,
  modelo: "saas",
  servicio: null,
  plan: plan || "desconocido",
  mes,
  anio
});

     // ✅ 3. Genera PDF localmente (sin redirigir a ningún lado)
// ✅ 3. Genera PDF profesional con logo, folio y fecha
const doc = new jsPDF();
const fechaHoy = new Date().toLocaleDateString("es-MX");
const folio = `RQ-${Date.now()}`;

// Logo (asegúrate de tenerlo en /public/logo-rqmarket.png)
const img = new Image();
img.src = "/logo-rqmarket.png";
doc.addImage(img, "PNG", 10, 10, 40, 15);

// Título centrado
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text("Propuesta Inteligente de RQ MARKET", 105, 30, { align: "center" });

// Datos a la derecha
doc.setFontSize(10);
doc.setFont("helvetica", "normal");
doc.text(`Folio: ${folio}`, 160, 15);
doc.text(`Fecha: ${fechaHoy}`, 160, 20);

// Contenido generado por IA
doc.setFontSize(11);
doc.text(propuestaIA, 10, 40, { maxWidth: 180 });

doc.save(`Propuesta_${formData.producto}.pdf`);

  
      // ✅ 4. Mensaje de éxito y limpieza
      setMensaje("✅ Tu solicitud fue enviada exitosamente y el PDF ha sido descargado.");
      setFormData({
        producto: "",
        cantidad: "",
        detalles: "",
        marca: "",
        modelo: "",
        unidad: "",
        ubicacion: "",
        proveedorPreferido: "",
        tiempoEntrega: "",
        presupuesto: ""
      });
      setRqMesActual(prev => prev + 1);
    } catch (error) {
      console.error("❌ Error al enviar:", error);
      setMensaje("❌ Error al conectar con el servidor.");
    }
  };
  
  return (
    <div className="dashboard-container">
      <h1>Bienvenido a tu panel de control</h1>
      {selected && (
        <>
          <p className="dashboard-subtitle">Estás utilizando el <strong>{selected.nombre}</strong></p>
          {selected.acciones.subirRQ && (
  <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "1.2rem", color: "#1e40af" }}>
    📊 Te quedan {limiteRQ === Infinity ? "∞" : `${limiteRQ - rqMesActual}`} de {limiteRQ === Infinity ? "∞" : limiteRQ} requisiciones este mes ({selected.nombre})
  </p>
)}

          <div className="dashboard-grid">
            {selected.beneficios.map((b: any, i: number) => (
              <div className="dashboard-card" key={i}>
                {b.icon}
                <h3>{b.titulo}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-actions">
            <h2>¿Qué deseas hacer ahora?</h2>
            {selected.acciones.subirRQ && (
              <button className="dashboard-btn azul" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                📤 Subir una nueva requisición
              </button>
            )}
  {limiteRQ !== Infinity && rqMesActual >= limiteRQ && (
  <div style={{
    marginTop: "1rem",
    backgroundColor: "#fff5f5",
    padding: "1.2rem",
    borderRadius: "12px",
    border: "1px solid #feb2b2",
    textAlign: "center"
  }}>
    <p style={{ color: "#c53030", fontWeight: "bold", marginBottom: "0.8rem" }}>
      ❌ Has alcanzado el límite de {limiteRQ} requisiciones este mes según tu plan <strong>{selected.nombre}</strong>.<br />
      Para enviar más, puedes cambiar de plan o esperar al próximo mes.
    </p>
    <button
      onClick={() => navigate("/contacto")}
      style={{
        backgroundColor: "#1e40af",
        color: "#fff",
        padding: "0.6rem 1.2rem",
        fontWeight: "600",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      📞 Contactar para ampliar plan
    </button>
  </div>
)}


            {selected.acciones.accesoEstafadores && (
              <button className="dashboard-btn verde" onClick={() => navigate("/verificacion/consulta-estafadores")}>
                🕵️ Consultar reportes de estafadores
              </button>
            )}
          </div>
        </>
      )}

{mostrarFormulario && (limiteRQ === Infinity || rqMesActual < limiteRQ) && (
  <form className="requisicion-form" onSubmit={handleSubmit}>
  <h4>Formulario de Requisición</h4>

  <div className="form-row">
    <div className="form-group">
      <label>Producto:</label>
      <input name="producto" required value={formData.producto} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Cantidad:</label>
      <input name="cantidad" type="number" required value={formData.cantidad} onChange={handleChange} />
    </div>
  </div>

  <div className="form-row">
  <div className="form-group">
  <label>Unidad:</label>
  <select name="unidad" value={formData.unidad} onChange={handleChange} required>
    <option value="">Selecciona una unidad</option>
    <option value="pieza">Pieza</option>
    <option value="kg">Kilogramo</option>
    <option value="litro">Litro</option>
    <option value="metro">Metro</option>
    <option value="caja">Caja</option>
    <option value="tonelada">Tonelada</option>
    <option value="otro">Otro</option>
  </select>
</div>

    <div className="form-group">
      <label>Marca:</label>
      <input name="marca" value={formData.marca} onChange={handleChange} />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Modelo:</label>
      <input name="modelo" value={formData.modelo} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Ubicación de entrega:</label>
      <input name="ubicacion" value={formData.ubicacion} onChange={handleChange} />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Proveedor preferido:</label>
      <input name="proveedorPreferido" value={formData.proveedorPreferido} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Días de entrega:</label>
      <input name="tiempoEntrega" type="number" value={formData.tiempoEntrega} onChange={handleChange} />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Presupuesto (por unidad):</label>
      <input name="presupuesto" type="number" step="0.01" value={formData.presupuesto} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Detalles adicionales:</label>
      <textarea name="detalles" rows={3} value={formData.detalles} onChange={handleChange}></textarea>
    </div>
  </div>

  <button type="submit">Enviar nueva requisición</button>
  {mensaje && <p className="mensaje-envio">{mensaje}</p>}
</form>

)}

    </div>
  );
}
