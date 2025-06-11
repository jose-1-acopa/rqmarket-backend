import React from "react";
import "./Modelos.css";
import { Link } from "react-router-dom";


export default function Modelos() {
  return (
    <>
      {/* Portada visual con fondo de imagen */}
      <div
        className="modelos-hero"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0, 40, 80, 0.8), rgba(0, 120, 212, 0.8)), url('/img/fondo-modelos.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="modelos-hero-content">
          <h1>Modelos de acceso</h1>
          <p>Elige cómo usar RQ MARKET según tus necesidades y nivel de operación.</p>
        </div>
      </div>

      {/* Sección de modelos en cards blancas */}
      <div className="modelos-container">
        <p className="modelos-subtitle">
          Elige la forma de uso que mejor se adapte a tus necesidades. Puedes acceder por
          suscripción, por evento o incluso delegar todo el proceso a nuestro equipo.
        </p>

        <div className="modelo-grid">
          <div className="modelo-card">
            <h2>🧠 Plataforma Inteligente (SaaS)</h2>
            <p>
              Ideal para empresas que desean controlar su proceso de compras pero necesitan agilidad,
              inteligencia artificial y acceso a una red confiable de proveedores. Incluye acceso a
              todos los servicios: generación de propuestas, IA de búsqueda, historial, verificación
              de proveedores y más. Puedes contratarlo mensual o anualmente.
            </p>
            <a href="#planes" className="btn-suscribirme">
              📋 Ver planes y precios
            </a>
          </div>

<div className="modelo-card">
  <h2>📦 Gestión completa de compras</h2>
  <p>
    Si prefieres que nos encarguemos de todo, este modelo es para ti. Solo sube tu
    requisición y nosotros realizamos la cotización, seleccionamos al proveedor más
    competitivo, compramos y entregamos por ti. Tú recibes la solución final sin
    complicaciones.
  </p>
  <Link to="/servicio-completo" className="btn-suscribirme" style={{ marginTop: "1rem", display: "inline-block" }}>
    Solicitar ahora
  </Link>
</div>

          <div className="modelo-card">
            <h2>🔍 Consulta de estafadores</h2>
            <p>
              Accede a nuestra base pública de reportes de fraude. Puedes consultar gratuitamente
              casos recientes o pagar para obtener acceso completo a filtros avanzados, búsquedas
              históricas y detalles clave.
            </p>
            <a
              href="/verificacion"
              className="btn-suscribirme"
              style={{ marginTop: "1rem", display: "inline-block" }}
            >
              Ir a Verificación
            </a>
          </div>

          <div className="modelo-card">
            <h2>✅ Verificación de empresa</h2>
            <p>
              Si eres proveedor, puedes certificar tu empresa y obtener el sello oficial de RQ
              MARKET. Esto te da mayor visibilidad y confianza ante los compradores. Incluye revisión
              documental, validación operativa y panel de gestión.
            </p>
  <Link to="/verificacion" className="btn-suscribirme" style={{ marginTop: "1rem", display: "inline-block" }}>
    Ir a Verificación
  </Link>
</div>
          </div>
        </div>
      

      {/* Sección de planes en fondo blanco separada */}
      <section id="planes" className="planes-precios">
        <h2 className="planes-title">Planes y precios</h2>
        <p className="planes-subtitle">
          Escoge el plan que se ajuste al volumen y necesidades de tu empresa. Todos los planes incluyen soporte técnico, acceso a mejoras y herramientas exclusivas.
        </p>

        <div className="planes-grid">
          <div className="plan-card">
            <h3>Básico</h3>
            <p className="plan-desc">Ideal para pequeños negocios que están comenzando a estructurar su proceso de compras.</p>
            <ul>
              <li>Hasta 6 RQ mensuales</li>
              <li>3 propuestas por cada RQ</li>
              <li>Propuestas en PDF</li>
              <li>Acceso limitado a últimos 10 reportes de estafadores</li>
            </ul>
            <p className="precio">$799 MXN / mes</p>
            <a href="/registro?plan=basico" className="btn-suscribirme">Suscribirme</a>
          </div>

          <div className="plan-card destacado">
            <h3>Empresarial</h3>
            <p className="plan-desc">Para empresas que requieren procesos más robustos, historial y múltiples búsquedas por requisición.</p>
            <ul>
              <li>Hasta 25 RQ mensuales</li>
              <li>3 búsquedas por RQ</li>
              <li>Propuestas detalladas y comparativas</li>
              <li>Historial completo de compras</li>
              <li>Acceso completo a base de estafadores</li>
              <li>1 verificación de proveedor incluida</li>
            </ul>
            <p className="precio">$2,499 MXN / mes</p>
            <a href="/registro?plan=empresarial" className="btn-suscribirme">Suscribirme</a>
          </div>

          <div className="plan-card">
            <h3>Corporativo</h3>
            <p className="plan-desc">Diseñado para grandes corporativos que requieren integración total, soporte avanzado y automatización.</p>
            <ul>
              <li>RQ ilimitadas</li>
              <li>Búsqueda avanzada de proveedores</li>
              <li>Asignación de ejecutivo de cuenta</li>
              <li>Certificación de empresa incluida</li>
              <li>API para integración con tu ERP</li>
              <li>Panel multiusuario</li>
              <li>Acceso completo a base de estafadores</li>
            </ul>
            <p className="precio">$6,990 MXN / mes</p>
            <a href="/registro?plan=corporativo" className="btn-suscribirme">Solicitar contacto</a>
          </div>
        </div>
      </section>
    </>
  );
}
