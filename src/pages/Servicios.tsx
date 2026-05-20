// src/pages/Servicios.tsx
import React from "react";
import { Link } from "react-router-dom"; // ✅ Importar Link
import "./Servicios.css";

{/* Portada tipo hero */}
export default function Servicios() {
  return (
    <div className="servicios-container">
  <section className="portada-servicios">
  <div className="portada-content">
  <h1 className="portada-title">Servicios inteligentes para tus compras</h1>
    <p className="portada-desc">
      Automatiza, verifica y optimiza tus procesos de adquisición desde un solo lugar. 
      Con RQ MARKET, las empresas compran mejor.
    </p>
    <div className="portada-cta">
    <Link to="/modelos" className="btn-azul">Ver modelos</Link>
    <Link to="/contacto" className="btn-blanco">Solicitar asesoría</Link>
    </div>
  </div>
</section>


      {/* BLOQUE 1: Optimización con IA */}
      <section id="optimizacion" className="servicio-bloque cruzado">
        <div className="texto">
          <h2> Optimización con IA</h2>
          <p>
            La optimización con inteligencia artificial es uno de los pilares de RQ MARKET. Nuestro sistema analiza
            automáticamente cada requisición que envías, entendiendo el contexto, tipo de producto o servicio, urgencia y
            variables clave como volumen, zona geográfica y categoría de compra. A partir de esta información, busca en
            tiempo real a los proveedores más adecuados, descartando los que no cumplen con requisitos mínimos y priorizando
            aquellos con mejor historial y tiempos de entrega. Esto se traduce en propuestas más rápidas, más ajustadas a tus
            necesidades y con un importante ahorro de tiempo operativo. Además, te libera de tareas repetitivas como contactar
            proveedores uno por uno, solicitar cotizaciones, validar información y comparar propuestas a mano.
          </p>
          <a href="/modelos" className="servicio-btn">Quiero usar este servicio</a>
        </div>
        <div className="imagen">
          <img src="/img/ia-optimizacion.png" alt="Optimización con IA" />
        </div>
      </section>

      {/* BLOQUE 2: Verificación de proveedores */}
      <section id="verificacion" className="servicio-bloque cruzado invertido">
        <div className="imagen">
          <img src="/img/verificacion.png" alt="Verificación de proveedores" />
        </div>
        <div className="texto">
          <h2> Verificación de proveedores</h2>
          <p>
            En RQ MARKET nos tomamos la seguridad muy en serio. Por eso implementamos un sistema riguroso de verificación
            para todos los proveedores que aparecen en nuestra plataforma. Esta verificación incluye revisión documental,
            validación de actividad comercial, referencias de clientes anteriores y comportamiento digital. Los proveedores
            que cumplen con todos los criterios reciben un sello de confianza que se muestra en cada propuesta que recibes.
            Esto reduce el riesgo de fraudes, aumenta la transparencia y te da mayor tranquilidad al momento de tomar
            decisiones de compra. La verificación puede ser consultada tanto por empresas suscritas como de manera individual
            para casos puntuales.
          </p>
          <a href="/modelos" className="servicio-btn">Quiero usar este servicio</a>
        </div>
      </section>

      {/* BLOQUE 3: Propuestas en PDF */}
      <section id="propuestas" className="servicio-bloque cruzado">
        <div className="texto">
          <h2> Propuestas automáticas en PDF</h2>
          <p>
            Uno de los diferenciadores de RQ MARKET es su capacidad de generar propuestas automáticas en formato PDF
            completamente listas para tomar decisiones. Estas propuestas contienen la información más relevante: nombre y
            contacto del proveedor, precio, ficha técnica, condiciones comerciales, plazo estimado de entrega y logotipo.
            Esto no solo profesionaliza el proceso de compra, sino que además te permite descargar, compartir o archivar las
            propuestas de forma clara y ordenada. Ideal para equipos de compras que deben justificar decisiones o hacer
            comparativas entre opciones.
          </p>
          <a href="/modelos" className="servicio-btn">Quiero usar este servicio</a>
        </div>
        <div className="imagen">
          <img src="/img/pdf-propuestas.png" alt="Propuestas en PDF" />
        </div>
      </section>

      {/* BLOQUE 4: Base de estafadores */}
      <section id="fraudes" className="servicio-bloque cruzado invertido">
        <div className="imagen">
          <img src="/img/denuncias.png" alt="Base de estafadores" />
        </div>
        <div className="texto">
          <h2> Base de estafadores y denuncias</h2>
          <p>
            Nuestro compromiso con la transparencia y la seguridad nos llevó a crear una base pública de empresas y personas
            que han sido reportadas por malas prácticas o fraudes en procesos de compra. Esta base puede consultarse
            gratuitamente con acceso limitado, y de forma completa mediante alguno de nuestros modelos de acceso. Además,
            RQ MARKET permite realizar denuncias anónimas de forma rápida, ayudando a que otros compradores estén alertas y
            se prevengan de caer en estafas. Este servicio es especialmente útil para empresas que desean tener un entorno
            de compras más confiable sin depender de referencias externas o recomendaciones informales.
          </p>
          <a href="/modelos" className="servicio-btn">Quiero usar este servicio</a>
        </div>
      </section>

      {/* BLOQUE 5: Clasificación automática */}
      <section id="clasificacion" className="servicio-bloque cruzado">
        <div className="texto">
          <h2> Clasificación automática</h2>
          <p>
            Nuestro sistema utiliza inteligencia artificial para leer y entender el contenido de tu requisición, incluso si
            está escrita en lenguaje natural. A partir de eso, la clasifica en una o varias categorías inteligentes que nos
            permiten activar automáticamente filtros y búsquedas dirigidas. Esto no solo agiliza el proceso, sino que mejora
            drásticamente la precisión al buscar proveedores, permitiendo que las propuestas que recibes estén alineadas con
            lo que realmente necesitas. También ayuda a evitar errores humanos, duplicidad de requisiciones o confusiones
            entre conceptos similares. Todo esto ocurre en segundos, sin intervención humana.
          </p>
          <a href="/modelos" className="servicio-btn">Quiero usar este servicio</a>
        </div>
        <div className="imagen">
          <img src="/img/clasificacion.png" alt="Clasificación automática" />
        </div>
      </section>

      {/* BLOQUE 6: Soluciones para empresas */}
      <section id="perfiles" className="servicio-bloque cruzado invertido">
        <div className="imagen">
          <img src="/img/empresas.png" alt="Soluciones para empresas" />
        </div>
        <div className="texto">
          <h2> Soluciones para todo tipo de empresa</h2>
          <p>
            RQ MARKET fue diseñado con la versatilidad en mente. Esto significa que no importa si eres una pequeña empresa
            que compra de vez en cuando o un gran corporativo con procesos complejos. Nuestra plataforma se adapta al perfil
            del usuario. Puedes utilizarla por evento único, suscribirte con planes escalables o incluso delegar todo el
            proceso con nosotros. Ya sea que seas una MiPyME, una constructora, una industria manufacturera o parte de un
            área de compras gubernamental, RQ MARKET tiene una solución a tu medida. Todos los servicios descritos están
            disponibles bajo distintas formas de acceso que puedes conocer en nuestra sección de modelos.
          </p>
          <a href="/modelos" className="servicio-btn">Ver formas de acceso</a>
        </div>
      </section>
    </div>
  );
}
