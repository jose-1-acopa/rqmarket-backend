/**
 * Cancelacion.tsx — Política de Cancelación y Suscripciones (contenido estático).
 * Ruta pública: /cancelacion
 */

import {
  LegalDoc,
  LegalSection,
  LegalP,
  LegalSubtitle,
  LegalList,
  LegalMail,
} from "../components/LegalDoc";

export default function Cancelacion() {
  return (
    <LegalDoc
      titulo="Política de Cancelación y Suscripciones — RQ MARKET"
      actualizado="5 de junio de 2026"
    >
      <LegalSection numero={1} titulo="Generalidades">
        <LegalP>
          RQ MARKET SA de CV (“RQ MARKET”) ofrece planes de suscripción con cargos
          recurrentes (mensuales o anuales) que se procesan a través de Stripe. Esta
          política describe cómo funcionan las cancelaciones y qué ocurre con su acceso al
          servicio.
        </LegalP>
      </LegalSection>

      <LegalSection numero={2} titulo="Cómo cancelar">
        <LegalP>
          Usted puede cancelar su suscripción en cualquier momento desde su cuenta,
          accediendo a la sección de gestión de suscripción (“Mi Suscripción”) o a través
          del portal de cliente de Stripe disponible en la Plataforma.
        </LegalP>
      </LegalSection>

      <LegalSection numero={3} titulo="Efecto de la cancelación">
        <LegalP>
          Al cancelar, usted conserva el acceso a las funciones de su plan hasta la fecha
          de finalización del periodo que ya tiene pagado o vigente. Es decir:
        </LegalP>
        <LegalList>
          <li>La cancelación detiene los cobros futuros.</li>
          <li>
            No se interrumpe el servicio de forma inmediata: usted mantiene el acceso hasta
            el final del periodo en curso (la fecha de corte de su ciclo de facturación).
          </li>
          <li>
            Una vez llegada esa fecha de finalización, la suscripción no se renueva y el
            acceso a las funciones de pago se desactiva.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection numero={4} titulo="Reembolsos">
        <LegalP>
          Los pagos ya realizados no son reembolsables, salvo que la ley aplicable disponga
          lo contrario. Al cancelar, no se genera un reembolso parcial por el tiempo no
          utilizado del periodo en curso; en su lugar, usted conserva el acceso hasta que
          dicho periodo termine, como se describe en la sección anterior.
        </LegalP>
      </LegalSection>

      <LegalSection numero={5} titulo="Promociones de lanzamiento (Primeras 100 Empresas)">
        <LegalP>
          RQ MARKET ofrece condiciones promocionales a las primeras empresas que se
          registran:
        </LegalP>
        <LegalList>
          <li>
            <span className="font-semibold text-ink-900">Empresas Iniciales:</span> las
            primeras 30 empresas obtienen un periodo promocional de 3 (tres) meses sin
            costo; concluido dicho periodo, aplica la tarifa regular del plan
            correspondiente.
          </li>
          <li>
            <span className="font-semibold text-ink-900">Empresas Aliadas:</span> las
            siguientes 70 empresas obtienen un periodo promocional de 3 (tres) meses a
            precio reducido; concluido dicho periodo, aplica la tarifa regular del plan
            correspondiente.
          </li>
        </LegalList>

        <LegalSubtitle>Cancelación durante el periodo promocional:</LegalSubtitle>
        <LegalP>Si usted cancela durante su periodo promocional:</LegalP>
        <LegalList>
          <li>No se le realizará ningún cobro futuro.</li>
          <li>
            Conserva el acceso a las funciones hasta que finalice el periodo promocional
            que se le otorgó (los 3 meses correspondientes). Al término de dicho periodo,
            el acceso se desactiva y no se renueva.
          </li>
          <li>
            En el caso de las Empresas Aliadas, los pagos promocionales ya realizados no
            son reembolsables.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection numero={6} titulo="Cambios de plan">
        <LegalP>
          Si usted cambia de un plan a otro, el cambio y los ajustes de cobro se gestionan
          a través del portal de Stripe conforme a las reglas de prorrateo que dicho
          sistema aplique, las cuales se le informarán al momento de realizar el cambio.
        </LegalP>
      </LegalSection>

      <LegalSection numero={7} titulo="Falta de pago">
        <LegalP>
          Si un cobro recurrente no puede procesarse (por ejemplo, por falta de fondos o
          tarjeta vencida), RQ MARKET podrá reintentar el cobro y, de no concretarse,
          suspender o cancelar el acceso a las funciones de pago.
        </LegalP>
      </LegalSection>

      <LegalSection numero={8} titulo="Contacto">
        <LegalP>
          Para dudas sobre cancelaciones o cobros, contáctenos en{" "}
          <LegalMail correo="informacion@rqmarket.com.mx" />.
        </LegalP>
      </LegalSection>
    </LegalDoc>
  );
}
