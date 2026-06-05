/**
 * Terminos.tsx — Términos y Condiciones de Uso (contenido estático).
 * Ruta pública: /terminos
 */

import {
  LegalDoc,
  LegalSection,
  LegalP,
  LegalSubtitle,
  LegalList,
  LegalMail,
} from "../components/LegalDoc";

export default function Terminos() {
  return (
    <LegalDoc titulo="Términos y Condiciones de Uso — RQ MARKET" actualizado="5 de junio de 2026">
      <LegalSection numero={1} titulo="Identificación del proveedor">
        <LegalP>
          El presente sitio web y plataforma, accesible en https://rqmarket.com.mx
          (“RQ MARKET”, “la Plataforma”, “nosotros”), es operado por RQ MARKET SA de CV
          (“la Empresa”), sociedad en proceso de constitución, con domicilio en Blvd.
          Antonio M. Quirazco 288, Las Choapas, Veracruz, México, y correo electrónico de
          contacto <LegalMail correo="informacion@rqmarket.com.mx" />.
        </LegalP>
      </LegalSection>

      <LegalSection numero={2} titulo="Objeto y descripción del servicio">
        <LegalP>
          RQ MARKET es una plataforma B2B (negocio a negocio) que ofrece un directorio de
          proveedores empresariales verificados, así como herramientas para la gestión de
          requisiciones de compra (RFQ) entre empresas. Como parte de su servicio, la
          Plataforma realiza una verificación del Registro Federal de Contribuyentes (RFC)
          de las empresas registradas contra listas públicas publicadas por el Servicio de
          Administración Tributaria (SAT).
        </LegalP>
        <LegalP>
          La verificación que realiza RQ MARKET es de carácter informativo y se basa
          exclusivamente en información pública disponible en los datos abiertos del SAT.
          RQ MARKET no garantiza la solvencia, cumplimiento fiscal total, capacidad
          operativa ni la honestidad comercial de ninguna empresa listada, y no sustituye
          la debida diligencia que cada usuario debe realizar antes de contratar con un
          tercero.
        </LegalP>
      </LegalSection>

      <LegalSection numero={3} titulo="Registro y cuenta de usuario">
        <LegalP>
          Para acceder a determinadas funciones, el usuario debe crear una cuenta
          proporcionando información veraz, completa y actualizada. El usuario es
          responsable de mantener la confidencialidad de sus credenciales de acceso y de
          toda actividad que ocurra bajo su cuenta.
        </LegalP>
        <LegalP>
          El registro como empresa proveedora requiere proporcionar, entre otros, el RFC,
          razón social, datos de contacto y categorías de actividad. Al registrarse, el
          usuario declara que cuenta con facultades para representar a la empresa que
          registra y que la información proporcionada es verídica.
        </LegalP>
        <LegalP>
          RQ MARKET se reserva el derecho de suspender o cancelar cuentas que proporcionen
          información falsa, que aparezcan en listas del SAT que impliquen incumplimientos
          graves, o que infrinjan estos Términos.
        </LegalP>
      </LegalSection>

      <LegalSection numero={4} titulo="Verificación contra listas del SAT">
        <LegalP>
          Al registrar una empresa, RQ MARKET consulta el RFC proporcionado contra
          diversas listas públicas del SAT. Según el resultado:
        </LegalP>
        <LegalList>
          <li>
            Los RFC que aparezcan en listas de incumplimientos graves podrán ser
            rechazados y no podrán completar su registro.
          </li>
          <li>
            Los RFC con observaciones menores podrán completar su registro, conservándose
            un señalamiento interno de dicha observación.
          </li>
        </LegalList>
        <LegalP>
          RQ MARKET únicamente verifica la presencia o ausencia del RFC en dichas listas y
          no almacena la información personal o fiscal contenida en las listas del SAT,
          salvo el resultado de la verificación para fines operativos y de auditoría.
        </LegalP>
      </LegalSection>

      <LegalSection numero={5} titulo="Planes, precios y cobros">
        <LegalP>
          RQ MARKET ofrece planes de suscripción de pago. Los precios vigentes se publican
          en la sección de Precios de la Plataforma y pueden incluir cargos recurrentes
          (mensuales o anuales).
        </LegalP>
        <LegalP>
          Los pagos se procesan a través de Stripe, un procesador de pagos externo.
          RQ MARKET no almacena ni tiene acceso a los datos completos de tarjetas de
          crédito o débito de los usuarios; dicha información es gestionada directamente
          por Stripe conforme a sus propias políticas y estándares de seguridad.
        </LegalP>
        <LegalP>
          Al contratar un plan con cargo recurrente, el usuario autoriza a que se realicen
          los cobros correspondientes de forma automática en cada periodo, hasta que
          cancele su suscripción conforme a la Política de Cancelación.
        </LegalP>
        <LegalSubtitle>Promociones de lanzamiento:</LegalSubtitle>
        <LegalP>
          RQ MARKET podrá ofrecer condiciones promocionales a las primeras empresas
          registradas (por ejemplo, periodos gratuitos o con precio reducido). Las
          condiciones específicas de cada promoción se informan al momento del registro y
          se rigen además por la Política de Cancelación.
        </LegalP>
      </LegalSection>

      <LegalSection numero={6} titulo="Uso aceptable">
        <LegalP>El usuario se obliga a utilizar la Plataforma de manera lícita y a no:</LegalP>
        <LegalList>
          <li>Proporcionar información falsa o suplantar la identidad de terceros.</li>
          <li>Utilizar la Plataforma para fines fraudulentos o contrarios a la ley.</li>
          <li>Extraer masivamente datos del directorio (scraping) sin autorización.</li>
          <li>
            Intentar vulnerar la seguridad de la Plataforma o acceder a datos de otros
            usuarios.
          </li>
          <li>
            Utilizar la información de contacto de otras empresas para fines distintos a
            los propios de una relación comercial B2B legítima.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection numero={7} titulo="Propiedad intelectual">
        <LegalP>
          Todos los derechos sobre la Plataforma, su software, diseño, marcas, logotipos y
          contenidos son propiedad de RQ MARKET SA de CV o de sus licenciantes. El uso de
          la Plataforma no concede al usuario ningún derecho de propiedad intelectual
          sobre la misma.
        </LegalP>
      </LegalSection>

      <LegalSection numero={8} titulo="Limitación de responsabilidad">
        <LegalP>
          RQ MARKET proporciona la Plataforma “tal cual” y “según disponibilidad”. En la
          máxima medida permitida por la ley:
        </LegalP>
        <LegalList>
          <li>No garantizamos que el servicio sea ininterrumpido o libre de errores.</li>
          <li>
            No somos responsables de las relaciones comerciales, negociaciones, contratos
            o disputas que surjan entre los usuarios de la Plataforma.
          </li>
          <li>
            No somos responsables de daños indirectos, incidentales o consecuenciales
            derivados del uso o imposibilidad de uso de la Plataforma.
          </li>
        </LegalList>
        <LegalP>
          La información de verificación del SAT se ofrece con fines informativos y no
          constituye asesoría fiscal, legal ni una garantía sobre el tercero verificado.
        </LegalP>
      </LegalSection>

      <LegalSection numero={9} titulo="Modificaciones">
        <LegalP>
          RQ MARKET podrá modificar estos Términos en cualquier momento. Las modificaciones
          se publicarán en esta página con su fecha de actualización. El uso continuado de
          la Plataforma tras la publicación de cambios constituye la aceptación de los
          mismos.
        </LegalP>
      </LegalSection>

      <LegalSection numero={10} titulo="Terminación">
        <LegalP>
          RQ MARKET podrá suspender o terminar el acceso de un usuario que incumpla estos
          Términos. El usuario podrá cancelar su cuenta en cualquier momento conforme a la
          Política de Cancelación.
        </LegalP>
      </LegalSection>

      <LegalSection numero={11} titulo="Legislación aplicable y jurisdicción">
        <LegalP>
          Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para
          cualquier controversia, las partes se someten a la jurisdicción de los tribunales
          competentes de Coatzacoalcos, Veracruz, renunciando a cualquier otro fuero que
          pudiera corresponderles.
        </LegalP>
      </LegalSection>

      <LegalSection numero={12} titulo="Contacto">
        <LegalP>
          Para cualquier duda sobre estos Términos, puede contactarnos en{" "}
          <LegalMail correo="informacion@rqmarket.com.mx" />.
        </LegalP>
      </LegalSection>
    </LegalDoc>
  );
}
