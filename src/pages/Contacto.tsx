import React from "react";
import "./Contacto.css";

export default function Contacto() {
  return (
    <section className="contacto-section">
      <div className="contacto-bg">
        <div className="contacto-content">
          {/* Lado izquierdo con mensaje fuerte */}
          <div className="contacto-left">
            <h1>
              Hablemos. <br />
              Conecta con un asesor de <span>RQ MARKET</span>
            </h1>
            <p>
              ¿Tienes dudas, necesitas una demo o quieres verificar un proveedor?
              Te respondemos personalmente.
            </p>

            <div className="contacto-datos">
              <p><strong>Correo:</strong> contacto@rqmarket.com</p>
              <p><strong>Teléfono / WhatsApp:</strong> +52 923 123 4567</p>
              <p><strong>Horario de atención:</strong> Lunes a Viernes de 9:00 a.m. a 6:00 p.m.</p>
              <p><strong>Dirección:</strong> Calle Reforma #123, Coatzacoalcos, Ver.</p>
            </div>
          </div>

          {/* Lado derecho con formulario */}
          <div className="contacto-form-card">
            <h2>Contáctanos</h2>
            <form>
              <div className="form-row">
                <input type="text" placeholder="Nombre" required />
                <input type="text" placeholder="Apellido" required />
              </div>
              <div className="form-row">
                <input type="email" placeholder="Correo corporativo" required />
                <input type="tel" placeholder="Teléfono" />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Empresa" />
                <input type="text" placeholder="Cargo" />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Ciudad" />
                <input type="text" placeholder="País" />
              </div>
              <textarea rows={4} placeholder="¿Cómo podemos ayudarte?" required />
              <button type="submit">Enviar mensaje</button>
            </form>
          </div>
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <div className="contacto-faq">
        <h2>Preguntas comunes</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h3>¿RQ MARKET tiene un costo mensual?</h3>
            <p>Ofrecemos planes mensuales y acceso puntual según tus necesidades.</p>
          </div>
          <div className="faq-item">
            <h3>¿Puedo verificar a un proveedor sin registrarme?</h3>
            <p>Sí. Puedes usar nuestra consulta puntual o adquirir acceso completo con verificación incluida.</p>
          </div>
          <div className="faq-item">
            <h3>¿En cuánto tiempo responden?</h3>
            <p>Respondemos en menos de 24 horas hábiles por correo o WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Cierre de confianza */}
      <div className="contacto-cierre">
        <p>
          En <strong>RQ MARKET</strong> valoramos tu tiempo, tu confianza y tu negocio.
          Gracias por contactarnos.
        </p>
      </div>
    </section>
  );
}
