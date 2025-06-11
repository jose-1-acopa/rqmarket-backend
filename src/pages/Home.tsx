import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Sección principal */}
      <section className="hero">
        <div className="hero-bg">
          <h1 className="home-title">
            La forma más inteligente y segura de resolver tus compras empresariales
          </h1>
          <p className="home-subtitle">
            Simplifica tus procesos, recibe propuestas optimizadas con IA y evita estafas en tus compras.
            Todo desde una sola plataforma.
          </p>
          <div className="cta-buttons">
            <Link to="/login">Enviar mi RQ</Link>
            <a href="#como-funciona">Conocer cómo funciona</a>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="flow-section">
        <h2 className="flow-title">¿Cómo funciona RQ MARKET?</h2>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-number">1</div>
            <h3 className="step-title">Sube tu RQ</h3>
            <p className="step-desc">Envía tu requisición en segundos desde nuestra plataforma.</p>
          </div>
          <div className="flow-step">
            <div className="step-number">2</div>
            <h3 className="step-title">La IA analiza</h3>
            <p className="step-desc">Buscamos proveedores reales y optimizamos tu propuesta.</p>
          </div>
          <div className="flow-step">
            <div className="step-number">3</div>
            <h3 className="step-title">Recibes propuesta</h3>
            <p className="step-desc">Te enviamos un PDF con opciones claras y verificadas.</p>
          </div>
          <div className="flow-step">
            <div className="step-number">4</div>
            <h3 className="step-title">Compra segura</h3>
            <p className="step-desc">Tú decides, nosotros damos seguimiento y verificación.</p>
          </div>
        </div>
      </section>

      {/* Oferta de valor */}
      <section className="oferta-valor-section">
        <div className="oferta-overlay">
          <div className="intro-text">
            <h2>¿Qué es RQ MARKET?</h2>
            <p>
              RQ MARKET es la plataforma mexicana que revoluciona las compras empresariales.
              Automatiza tus procesos, conecta con proveedores verificados, recibe propuestas
              inteligentes y evita fraudes.
            </p>
          </div>

          <h2 className="oferta-titulo">Oferta de valor</h2>

          <div className="oferta-cards">
            <div className="oferta-card">
              <h3>Optimización con IA</h3>
              <p>Mejora tus tiempos y reduce costos con inteligencia artificial.</p>
              <a href="/servicios">Leer más →</a>
            </div>
            <div className="oferta-card">
              <h3>Compra segura</h3>
              <p>Proveedores verificados, sello de confianza y transacciones protegidas.</p>
              <a href="/servicios">Leer más →</a>
            </div>
            <div className="oferta-card">
              <h3>Propuestas en PDF</h3>
              <p>Recibe documentos listos para decidir: ficha técnica, contacto y precio.</p>
              <a href="/servicios">Leer más →</a>
            </div>
            <div className="oferta-card">
              <h3>Antifraude empresarial</h3>
              <p>Consulta y denuncia en nuestra base pública de estafadores.</p>
              <a href="/servicios">Leer más →</a>
            </div>
            <div className="oferta-card">
              <h3>Clasificación inteligente</h3>
              <p>Analizamos tu RQ, la clasificamos y buscamos proveedores automáticamente.</p>
              <a href="/servicios">Leer más →</a>
            </div>
            <div className="oferta-card">
              <h3>Solución para empresas</h3>
              <p>Ideal para MiPyMEs, constructoras, industrias, gobierno y más.</p>
              <a href="/servicios">Leer más →</a>
            </div>
          </div>

          <div className="oferta-botones">
            <a href="/nosotros" className="btn-blanco">Ver más sobre RQ MARKET</a>
            <a href="/registro" className="btn-transparente">Crear cuenta gratis</a>
          </div>
        </div>
      </section>

      {/* Protección y beneficios */}
      <section className="cta-proteccion">
        <h2 className="cta-title">Compra con confianza</h2>
        <p className="cta-subtitle">
          En RQ MARKET no solo conectamos compradores con proveedores…<br />
          Creamos un entorno confiable:
        </p>

        <div className="confianza-cards">
          <div className="confianza-card">
            <img src="/img/icon-database.png" alt="Base de datos" className="confianza-icon" />
            <h3>BASE DE DATOS PÚBLICA</h3>
            <p>Consulta si una empresa ha sido reportada por fraude antes de comprar.</p>
          </div>
          <div className="confianza-card">
            <img src="/img/icon-anonimo.png" alt="Denuncias anónimas" className="confianza-icon" />
            <h3>DENUNCIAS ANÓNIMAS</h3>
            <p>Sube una denuncia documentada de forma segura y confidencial.</p>
          </div>
          <div className="confianza-card">
            <img src="/img/icon-verificado.png" alt="Empresa verificada" className="confianza-icon" />
            <h3>EMPRESA VERIFICADA</h3>
            <p>Accede al sello de confianza para validar empresas con respaldo documental.</p>
          </div>
        </div>

        <div className="cta-boton">
          <a href="/consultaEstafadores" className="cta-btn">
            Consultar base de datos de estafadores →
          </a>
        </div>
      </section>

      {/* Anuncio IA */}
      <section className="ia-banner">
        <div className="ia-content">
          <div className="ia-text">
            <h2>Automatiza tus compras con IA</h2>
            <p>
              RQ MARKET analiza tu requisición, busca proveedores reales y te entrega propuestas inteligentes.
            </p>
            <a href="/requisicion" className="btn-cta-rq">Enviar mi RQ</a>
          </div>
          <img src="/img/ia-rqmarket.png" alt="Inteligencia Artificial RQ" className="ia-image" />
        </div>
      </section>

      {/* Perfiles empresariales */}
      <section className="perfiles-grid">
        <h2 className="perfiles-title">
          ¿Para quién está dirigido <span>RQ MARKET</span>?
        </h2>
        <p className="perfiles-desc">
          RQ MARKET está diseñado para cualquier empresa que quiera optimizar sus compras, ahorrar tiempo y evitar fraudes.
          Desde pequeñas empresas que requieren agilidad, hasta grandes corporativos con procesos complejos, la plataforma se adapta a distintos sectores con soluciones inteligentes y automatizadas.
        </p>

        <div className="perfiles-cards">
          <div className="perfil-item">
            <img src="/img/icon-mipyme.png" alt="MiPyMEs" className="perfil-icon-img" />
            <p>Pequeñas y medianas empresas (MiPyMEs).</p>
          </div>
          <div className="perfil-item">
            <img src="/img/icon-construccion.png" alt="Constructoras" className="perfil-icon-img" />
            <p>Constructoras y contratistas.</p>
          </div>
          <div className="perfil-item">
            <img src="/img/icon-industria.png" alt="Industrias" className="perfil-icon-img" />
            <p>Industrias manufactureras.</p>
          </div>
          <div className="perfil-item">
            <img src="/img/icon-corporativo.png" alt="Corporativos" className="perfil-icon-img" />
            <p>Áreas de compras de grandes corporativos.</p>
          </div>
        </div>
      </section>

      {/* Formas de uso */}
      <section className="feature-section">
        <div className="feature-content">
          <section className="formas-uso">
            <h2 className="section-title">¿Cómo puedes usar <span>RQ MARKET</span>?</h2>
            <p className="section-subtitle">
              Una solución para cada necesidad. Ya sea que requieras control total o prefieras que nos encarguemos por ti.
            </p>

            <div className="uso-cards">
              <div className="uso-card">
                <img src="/img/saas.png" alt="SaaS" className="uso-img" />
                <h3>Plataforma Inteligente (SaaS)</h3>
                <p>Utiliza nuestra IA, accede a proveedores verificados y recibe propuestas automáticas. Ideal si tú controlas tus compras.</p>
                <a href="/registro" className="btn-uso">Lo quiero</a>
              </div>
              <div className="uso-card">
                <img src="/img/gestion.png" alt="Gestión completa" className="uso-img" />
                <h3>Gestión completa de compras</h3>
                <p>Nosotros cotizamos, elegimos el mejor proveedor, compramos y te entregamos. Tú solo apruebas.</p>
                <a href="/contacto" className="btn-uso">Lo quiero</a>
              </div>
              <div className="uso-card">
                <img src="/img/puntual.png" alt="Uso puntual" className="uso-img" />
                <h3>Acceso por uso puntual</h3>
                <p>No necesitas cuenta ni suscripción. Solicita una propuesta y recibe la solución lista para decidir.</p>
                <a href="/servicios" className="btn-uso">Conoce más</a>
              </div>
              <div className="uso-card">
                <img src="/img/estafadores.png" alt="Consulta estafadores" className="uso-img" />
                <h3>Consulta de estafadores</h3>
                <p>Accede a nuestra base pública de empresas reportadas. Protege tus compras desde antes de decidir.</p>
                <a href="/verificacion" className="btn-uso">Consultar</a>
              </div>
              <div className="uso-card">
                <img src="/img/verificacion.png" alt="Verificación" className="uso-img" />
                <h3>Verificación de empresa</h3>
                <p>Haz que tu empresa destaque con nuestro sello de confianza. Aumenta tu visibilidad y credibilidad.</p>
                <a href="/verificacion" className="btn-uso">Verificar</a>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Comparativa */}
      <section className="comparison-section">
        <h2 className="comparison-title">¿Por qué elegir <span>RQ MARKET</span>?</h2>

        <div className="comparison-cards">
          <div className="comparison-card rqmarket">
            <h3>RQ MARKET</h3>
            <p className="price-tag">✅ Plataforma inteligente</p>
            <ul>
              <li>✔ Propuestas automáticas con IA</li>
              <li>✔ Base pública de estafadores</li>
              <li>✔ Sello de empresa verificada</li>
              <li>✔ PDF profesional con ficha técnica</li>
              <li>✔ Tiempo de respuesta: en horas</li>
              <li>✔ Búsqueda de proveedores incluida</li>
              <li>✔ Clasificación automática por IA</li>
              <li>✔ Seguimiento postventa</li>
              <li>✔ Sin suscripción obligatoria</li>
            </ul>
          </div>

          <div className="comparison-card tradicional">
            <h3>Método tradicional</h3>
            <p className="price-tag">❌ Manual y riesgoso</p>
            <ul>
              <li>✘ Procesos lentos y sin IA</li>
              <li>✘ No hay verificación de empresas</li>
              <li>✘ Riesgo alto de estafas</li>
              <li>✘ Cotizaciones poco claras</li>
              <li>✘ Tiempo de respuesta: días o semanas</li>
              <li>✘ Tú haces todo</li>
              <li>✘ Sin clasificación automatizada</li>
              <li>✘ Sin seguimiento ni respaldo</li>
              <li>✘ Alta carga operativa</li>
            </ul>
          </div>
        </div>

        <div className="cta-centrado">
          <a href="/registro" className="btn-comparativa azul grande">Crear cuenta gratis</a>
        </div>
      </section>
    </div>
  );
};

export default Home;
