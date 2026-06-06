import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { Input, Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Accordion, AccordionItem } from "../components/ui/Accordion";
import { Reveal } from "../components/ui/Reveal";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    empresa: "",
    cargo: "",
    ciudad: "",
    mensaje: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = [
      `Nombre: ${form.nombre} ${form.apellido}`,
      `Email: ${form.email}`,
      `Teléfono: ${form.telefono}`,
      `Empresa: ${form.empresa}`,
      `Cargo: ${form.cargo}`,
      `Ciudad: ${form.ciudad}`,
      ``,
      `Mensaje:`,
      form.mensaje,
    ].join("\n");
    const subject = `Contacto desde rqmarket.com.mx — ${form.empresa || form.nombre}`;
    window.location.href = `mailto:informacion@rqmarket.com.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Hero institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Contacto
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Hablemos sobre tu operación de procura.
          </h1>
          <p className="mt-3 text-ink-600 max-w-2xl">
            Demos, dudas sobre la validación contra el SAT, planes para equipos. Te respondemos por correo o WhatsApp en menos de 24 horas hábiles.
          </p>
        </Reveal>
      </header>

      {/* Contacto + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Info de contacto */}
          <aside className="lg:col-span-2 space-y-3">
            <ContactCard
              icon={<Mail size={18} />}
              label="Correo"
              value="informacion@rqmarket.com.mx"
              href="mailto:informacion@rqmarket.com.mx"
              mono
            />
            <ContactCard
              icon={<Phone size={18} />}
              label="Teléfono / WhatsApp"
              value="+52 923 123 4567"
              href="https://wa.me/529231234567"
              mono
            />
            <ContactCard
              icon={<Clock size={18} />}
              label="Horario"
              value="Lunes a viernes, 9:00 a 18:00 h (CST)"
            />
            <ContactCard
              icon={<MapPin size={18} />}
              label="Oficina"
              value="Calle Reforma #123, Coatzacoalcos, Veracruz"
            />
          </aside>

          {/* Formulario */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-ink-200 rounded p-6 sm:p-8 shadow-card"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
                Formulario de contacto
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink-900 tracking-tight">
                Escríbenos
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Llena los datos y abriremos tu cliente de correo con el mensaje listo para enviar.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
                <Input
                  label="Apellido"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
                <Input
                  label="Correo corporativo"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="tu@empresa.com"
                />
                <Input
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                <Input
                  label="Empresa"
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                />
                <Input
                  label="Cargo"
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  placeholder="Ej: Director de compras"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Ciudad"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea
                    label="¿Cómo podemos ayudarte?"
                    name="mensaje"
                    rows={4}
                    value={form.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="Cuéntanos brevemente qué necesitas (demo, validación de proveedor, plan corporativo, etc.)"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" rightIcon={<ArrowRight size={16} />}>
                  Enviar mensaje
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-ink-200">
        <Reveal as="div" className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink-900 tracking-tight">
            Antes de escribirnos
          </h2>
          <div className="mt-6">
            <Accordion>
              <AccordionItem question="¿RQ MARKET tiene un costo mensual?">
                El acceso al directorio es gratuito para compradores. Existen planes opcionales con funciones avanzadas (más requisiciones, panel multiusuario, certificación) para equipos de procura.
              </AccordionItem>
              <AccordionItem question="¿Puedo verificar a un proveedor sin registrarme?">
                El directorio público permite consultar el listado de proveedores con su RFC validado contra el SAT sin necesidad de cuenta. Para acceder a los datos de contacto, necesitas un plan activo.
              </AccordionItem>
              <AccordionItem question="¿En cuánto tiempo responden?">
                Por correo o WhatsApp respondemos en menos de 24 horas hábiles. Los registros de proveedores nuevos los revisamos en 1–3 días hábiles antes de publicarlos.
              </AccordionItem>
              <AccordionItem question="¿Cobran comisión por contacto con proveedores?">
                No. Una vez que el comprador y el proveedor entran en contacto, RQ MARKET no participa en la negociación ni cobra comisión por la transacción.
              </AccordionItem>
            </Accordion>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  const content = (
    <div className="bg-white border border-ink-200 rounded p-4 flex items-start gap-3 shadow-card hover:border-brand-500 hover:shadow-card-hover hover:-translate-y-0.5 transition duration-200">
      <span className="shrink-0 w-9 h-9 rounded bg-brand-50 border border-brand-100 text-brand-700 inline-flex items-center justify-center">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          {label}
        </div>
        <div className={`mt-0.5 text-sm text-ink-900 ${mono ? "font-mono" : ""} break-words`}>
          {value}
        </div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block focus:outline-none focus-visible:shadow-focus rounded">
      {content}
    </a>
  ) : (
    content
  );
}
