/**
 * Privacidad.tsx — Aviso de Privacidad (contenido estático).
 * Ruta pública: /privacidad
 */

import {
  LegalDoc,
  LegalSection,
  LegalP,
  LegalSubtitle,
  LegalList,
  LegalMail,
} from "../components/LegalDoc";

export default function Privacidad() {
  return (
    <LegalDoc titulo="Aviso de Privacidad — RQ MARKET" actualizado="5 de junio de 2026">
      <LegalSection numero={1} titulo="Identidad y domicilio del responsable">
        <LegalP>
          RQ MARKET SA de CV (“RQ MARKET”), sociedad en proceso de constitución, con
          domicilio en Blvd. Antonio M. Quirazco 288, Las Choapas, Veracruz, México, es
          responsable del tratamiento y protección de sus datos personales, conforme a lo
          dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares (LFPDPPP), su Reglamento y demás normativa aplicable.
        </LegalP>
        <LegalP>
          Correo de contacto para asuntos de privacidad:{" "}
          <LegalMail correo="informacion@rqmarket.com.mx" />
        </LegalP>
      </LegalSection>

      <LegalSection numero={2} titulo="Datos personales que recabamos">
        <LegalP>
          Para las finalidades señaladas en este aviso, RQ MARKET puede recabar los
          siguientes datos:
        </LegalP>

        <LegalSubtitle>Datos de identificación y contacto:</LegalSubtitle>
        <LegalList>
          <li>Nombre del responsable o representante de la empresa</li>
          <li>Correo electrónico</li>
          <li>Número telefónico / WhatsApp</li>
        </LegalList>

        <LegalSubtitle>Datos fiscales y empresariales:</LegalSubtitle>
        <LegalList>
          <li>Registro Federal de Contribuyentes (RFC)</li>
          <li>Razón social</li>
          <li>Tipo de persona (moral o física)</li>
          <li>Estado y ciudad</li>
          <li>Sitio web (en su caso)</li>
          <li>Categorías de actividad y descripción de la empresa</li>
        </LegalList>

        <LegalSubtitle>Datos derivados del uso de la Plataforma:</LegalSubtitle>
        <LegalList>
          <li>Información de la cuenta de usuario (autenticación)</li>
          <li>
            Registro de actividad y operaciones realizadas en la Plataforma, conservado
            con fines de auditoría
          </li>
          <li>Resultado de la verificación del RFC contra listas públicas del SAT</li>
        </LegalList>

        <LegalP>
          RQ MARKET no recaba datos personales sensibles. Los datos de tarjetas de pago son
          tratados directamente por nuestro procesador de pagos (Stripe) y no son
          almacenados por RQ MARKET.
        </LegalP>
      </LegalSection>

      <LegalSection numero={3} titulo="Finalidades del tratamiento">
        <LegalSubtitle>Finalidades primarias (necesarias para el servicio):</LegalSubtitle>
        <LegalList>
          <li>Crear y administrar su cuenta de usuario.</li>
          <li>
            Registrar y publicar a su empresa en el directorio de proveedores verificados.
          </li>
          <li>Verificar el RFC contra listas públicas del SAT con fines de validación.</li>
          <li>
            Procesar los pagos de los planes de suscripción contratados (a través de
            Stripe).
          </li>
          <li>
            Gestionar las requisiciones de compra (RFQ) y facilitar el contacto entre
            empresas.
          </li>
          <li>
            Mantener un registro de operaciones con fines de auditoría, seguridad y
            cumplimiento.
          </li>
          <li>Atender solicitudes, dudas y brindar soporte.</li>
        </LegalList>

        <LegalSubtitle>Finalidades secundarias (no necesarias para el servicio):</LegalSubtitle>
        <LegalList>
          <li>
            Enviar comunicaciones sobre novedades, mejoras o información relevante de la
            Plataforma.
          </li>
          <li>Realizar análisis estadísticos para mejorar nuestros servicios.</li>
        </LegalList>

        <LegalP>
          Si usted no desea que sus datos sean tratados para las finalidades secundarias,
          puede manifestarlo enviando un correo a{" "}
          <LegalMail correo="informacion@rqmarket.com.mx" />. Su negativa no será motivo
          para negarle los servicios que solicita.
        </LegalP>
      </LegalSection>

      <LegalSection numero={4} titulo="Verificación contra listas del SAT">
        <LegalP>
          Como parte del servicio, RQ MARKET consulta el RFC que usted proporciona contra
          listas públicas publicadas por el SAT en sus datos abiertos. RQ MARKET únicamente
          conserva el resultado de dicha verificación (si el RFC se encuentra o no en
          determinada lista) para fines operativos y de auditoría, y no almacena la
          información personal o fiscal contenida en las listas del propio SAT.
        </LegalP>
      </LegalSection>

      <LegalSection numero={5} titulo="Transferencias de datos">
        <LegalP>
          RQ MARKET no vende ni comercializa sus datos personales. Podemos compartir datos
          con terceros únicamente en los siguientes casos:
        </LegalP>
        <LegalList>
          <li>
            <span className="font-semibold text-ink-900">Procesador de pagos (Stripe):</span>{" "}
            para procesar los cobros de las suscripciones. Stripe trata los datos conforme
            a sus propias políticas de privacidad y estándares de seguridad.
          </li>
          <li>
            <span className="font-semibold text-ink-900">
              Proveedores de infraestructura tecnológica:
            </span>{" "}
            servicios de alojamiento y bases de datos necesarios para operar la Plataforma.
          </li>
          <li>
            <span className="font-semibold text-ink-900">Autoridades competentes:</span>{" "}
            cuando exista un requerimiento legal o una obligación derivada de la ley.
          </li>
        </LegalList>
        <LegalP>
          Dentro de la naturaleza B2B de la Plataforma, la información de su empresa
          publicada en el directorio (razón social, categorías, datos de contacto
          comercial) será visible para otros usuarios con fines de establecer relaciones
          comerciales legítimas.
        </LegalP>
      </LegalSection>

      <LegalSection numero={6} titulo="Derechos ARCO">
        <LegalP>
          Usted tiene derecho a Acceder a sus datos personales, Rectificarlos cuando sean
          inexactos, Cancelarlos cuando considere que no se requieren para alguna de las
          finalidades señaladas, y Oponerse a su tratamiento (derechos ARCO).
        </LegalP>
        <LegalP>
          Para ejercer estos derechos, envíe una solicitud al correo{" "}
          <LegalMail correo="informacion@rqmarket.com.mx" />, indicando:
        </LegalP>
        <LegalList>
          <li>Su nombre y datos de contacto.</li>
          <li>
            La descripción clara de los datos sobre los que busca ejercer el derecho.
          </li>
          <li>El derecho que desea ejercer.</li>
        </LegalList>
        <LegalP>Daremos respuesta a su solicitud en los plazos que marca la LFPDPPP.</LegalP>
      </LegalSection>

      <LegalSection numero={7} titulo="Revocación del consentimiento">
        <LegalP>
          Usted puede revocar en cualquier momento el consentimiento que nos ha otorgado
          para el tratamiento de sus datos, enviando su solicitud a{" "}
          <LegalMail correo="informacion@rqmarket.com.mx" />. Tome en cuenta que, para
          ciertos fines, la revocación podría implicar que no podamos seguir prestándole el
          servicio.
        </LegalP>
      </LegalSection>

      <LegalSection numero={8} titulo="Conservación de datos">
        <LegalP>
          Conservaremos sus datos durante el tiempo que mantenga una relación con
          RQ MARKET y, posteriormente, durante los plazos necesarios para cumplir
          obligaciones legales, fiscales y de auditoría.
        </LegalP>
      </LegalSection>

      <LegalSection numero={9} titulo="Uso de cookies y tecnologías de rastreo">
        <LegalP>
          La Plataforma utiliza cookies y tecnologías similares estrictamente necesarias
          para su funcionamiento y para la autenticación de su cuenta. En caso de
          incorporar herramientas de análisis o medición, se actualizará el presente aviso
          para informarlo oportunamente.
        </LegalP>
      </LegalSection>

      <LegalSection numero={10} titulo="Cambios al aviso de privacidad">
        <LegalP>
          RQ MARKET podrá actualizar este Aviso de Privacidad. Cualquier cambio se
          publicará en https://rqmarket.com.mx con su fecha de actualización.
        </LegalP>
      </LegalSection>

      <LegalSection numero={11} titulo="Consentimiento">
        <LegalP>
          Al proporcionar sus datos personales y utilizar la Plataforma, usted manifiesta
          su conformidad con el tratamiento de los mismos conforme a este Aviso de
          Privacidad.
        </LegalP>
      </LegalSection>
    </LegalDoc>
  );
}
