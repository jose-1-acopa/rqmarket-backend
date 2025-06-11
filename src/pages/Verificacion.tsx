import { Link } from "react-router-dom";
import "../pages/Verificacion.css";

export default function Verificacion() {
  return (
    <section className="verificacion-container">
      {/* Portada visual tipo hero con imagen de fondo */}
      <div
        className="verificacion-hero-bg"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 40, 80, 0.8), rgba(0, 120, 212, 0.8)), url("/img/fondo-verificacion.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="verificacion-hero-content">
          <h1 className="verificacion-hero-title">Verificación y Antifraude</h1>
          <p className="verificacion-hero-text">
            ¿Te han estafado o desconfiado de un proveedor? En RQ MARKET trabajamos para que tus compras sean seguras, confiables y sin estafas.
          </p>
        </div>
      </div>

      <h2 className="verificacion-frase-impacto">
        Te damos <strong>herramientas reales</strong> para que tus compras sean <strong>seguras</strong>, <strong>confiables</strong> y <strong>sin estafas</strong>.
      </h2>

      {/* Tarjetas funcionales con íconos personalizados */}
      <div className="verificacion-grid">
        <Link to="/verificacion/consulta-estafadores" className="verificacion-box">
          <img src="/img/icon-estafadores.png" alt="Icono Estafadores" className="verificacion-icon-img" />
          <h3 className="verificacion-heading">Consulta de Estafadores</h3>
          <p>Accede a una base de datos actualizada con reportes de estafas. Consulta gratuita o con suscripción para acceso completo.</p>
        </Link>

        <Link to="/verificacion/denuncia" className="verificacion-box">
          <img src="/img/icon-denuncia.png" alt="Icono Denuncia" className="verificacion-icon-img" />
          <h3 className="verificacion-heading">Denuncia en Línea</h3>
          <p>¿Has sido víctima de fraude? Denuncia fácilmente y ayuda a otros compradores a prevenirse.</p>
        </Link>

        <Link to="/verificacion/empresas-verificadas" className="verificacion-box">
          <img src="/img/icon-verificadas.png" alt="Icono Empresas Verificadas" className="verificacion-icon-img" />
          <h3 className="verificacion-heading">Empresas Verificadas</h3>
          <p>Empresas con documentación validada, sello de confianza y mayor visibilidad en propuestas.</p>
        </Link>

        <Link to="/verificacion/reputacion" className="verificacion-box">
          <img src="/img/icon-reputacion.png" alt="Icono Reputación" className="verificacion-icon-img" />
          <h3 className="verificacion-heading">Reputación Transparente</h3>
          <p>Consulta el nivel de reputación basado en reseñas verificadas.</p>
        </Link>
      </div>

      {/* Sección ¿Sabías que...? profesional */}
      <div className="verificacion-data-section">
        <h2 className="verificacion-data-title">¿Sabías que...?</h2>

        <div className="verificacion-data-grid">
          <div className="verificacion-data-box">
            <img src="/img/icon-alerta.png" alt="Alerta" />
            <p><strong>El 42% de las empresas</strong><br />han sido víctimas de fraude en compras.</p>
          </div>

          <div className="verificacion-data-box">
            <img src="/img/icon-dinero.png" alt="Pérdidas" />
            <p><strong>Las pérdidas promedio</strong><br />por estafa superan los $150,000 MXN.</p>
          </div>

          <div className="verificacion-data-box">
            <img src="/img/icon-grafica.png" alt="Verificación" />
            <p><strong>La falta de verificación</strong><br />reduce un 60% la probabilidad de cerrar compras seguras.</p>
          </div>
        </div>

        <p className="verificacion-data-foot">
          RQ MARKET nació para combatir estos problemas y devolverte la confianza.
        </p>
      </div>

      {/* Información adicional y llamada a la acción */}
      <div className="verificacion-banner-call">
  Actúa hoy. <strong>Protege tu empresa</strong>, <strong>protege tu dinero</strong>.
</div>


      {/* Testimonios reales */}
      <div className="verificacion-testimonios">
        <h2 className="testimonios-title">Lo que dicen otros compradores</h2>
        <div className="testimonios-lista">
          <blockquote>
            “Creí que era un proveedor serio. Nunca llegó el material, y perdimos una semana de producción.”
            <footer>— Gerente de Compras en empresa de plásticos</footer>
          </blockquote>
          <blockquote>
            “Con RQ MARKET ahora solo trabajo con proveedores verificados. Me siento más tranquilo y respaldo mis decisiones.”
            <footer>— Responsable de compras industriales</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
