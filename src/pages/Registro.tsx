import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Registro.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function Registro() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get("plan");
  const [enviando, setEnviando] = useState(false);

  const planesInfo: Record<string, any> = {
    basico: {
      nombre: "Plan Básico",
      precio: "$799 MXN / mes",
      beneficios: [
        "Hasta 6 RQ mensuales",
        "3 propuestas comparativas por RQ",
        "Propuestas en PDF con datos clave",
        "Acceso limitado a últimos 10 reportes de estafadores"
      ]
    },
    empresarial: {
      nombre: "Plan Empresarial",
      precio: "$2,499 MXN / mes",
      beneficios: [
        "Hasta 25 RQ mensuales",
        "3 búsquedas por RQ",
        "Comparativas detalladas",
        "Historial de compras",
        "Base de estafadores completa",
        "1 verificación de proveedor incluida"
      ]
    },
    corporativo: {
      nombre: "Plan Corporativo",
      precio: "$6,990 MXN / mes",
      beneficios: [
        "RQ ilimitadas",
        "Búsqueda avanzada de proveedores",
        "Ejecutivo de cuenta asignado",
        "Certificación incluida",
        "API con tu ERP",
        "Panel multiusuario"
      ]
    }
  };

  const selected = plan && planesInfo[plan];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        nombre: form.nombre.value,
        empresa: form.empresa.value,
        telefono: form.telefono.value,
        medioContacto: form.medio.value,
        mensaje: form.mensaje.value,
        plan: plan,
        fechaRegistro: new Date().toISOString()
      });

      navigate(`/dashboard?plan=${plan}`);
    } catch (error: any) {
      alert("❌ Error al crear cuenta: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="registro-section">
      <div className="registro-wrapper">
        {/* Imagen lateral */}
        <div className="registro-banner" />

        {/* Contenido y formulario */}
        <div className="registro-form-box">
          <h1>Suscripción a RQ MARKET</h1>
          {selected && (
            <div className="plan-info">
              <h2>{selected.nombre}</h2>
              <p className="plan-precio">{selected.precio}</p>
              <ul className="beneficios-lista">
                {selected.beneficios.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          <h3>Completa tus datos</h3>
          <form className="registro-form" onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre completo" required />
            <input type="text" name="empresa" placeholder="Empresa" />
            <input type="email" name="email" placeholder="Correo electrónico" required />
            <input type="tel" name="telefono" placeholder="Teléfono" />
            <select name="medio" required>
              <option value="">Medio de contacto preferido</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada</option>
            </select>
            <textarea name="mensaje" placeholder="¿Cómo podemos ayudarte?" rows={3} />
            <input type="password" name="password" placeholder="Contraseña (mínimo 6 caracteres)" required />

            <button type="submit" disabled={enviando}>
              {enviando ? "Creando cuenta..." : `Suscribirme al ${selected?.nombre}`}
            </button>
          </form>

          <div className="registro-pie">
            <p>📧 contacto@rqmarket.com</p>
            <p>📞 +52 923 123 4567</p>
            <p>🕒 Lunes a Viernes de 9:00 a.m. a 6:00 p.m.</p>
            <p className="registro-gracias">
              En RQ MARKET valoramos tu tiempo, tu confianza y tu negocio. Gracias por contactarnos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
