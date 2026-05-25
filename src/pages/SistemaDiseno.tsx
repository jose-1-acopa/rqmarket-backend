/**
 * SistemaDiseno.tsx
 *
 * Página interna para visualizar todos los componentes del sistema de diseño.
 * Se accede en /sistema-diseno
 *
 * Sirve para:
 *   - Ver cómo se ven los componentes
 *   - Validar variantes y tamaños
 *   - Servir como referencia visual cuando construimos páginas reales
 */

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardBody, CardFooter } from "../components/ui/Card";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Badge, TierBadge, EstadoBadge } from "../components/ui/Badge";
import { Container, Section } from "../components/ui/Container";

export default function SistemaDiseno() {
  const [inputDemo, setInputDemo] = useState("");
  const [selectDemo, setSelectDemo] = useState("");

  return (
    <Container size="wide">
      {/* Hero */}
      <div className="py-8 mb-6 border-b border-ink-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">
            v1.0
          </span>
          <span className="text-xs text-ink-500">RQ Market Design System</span>
        </div>
        <h1 className="text-4xl font-semibold text-ink-900 mb-2">
          Sistema de diseño
        </h1>
        <p className="text-lg text-ink-500 max-w-2xl">
          Componentes y patrones visuales que dan forma a RQ MARKET.
          Diseñado para confianza B2B industrial.
        </p>
      </div>

      {/* TIPOGRAFÍA */}
      <Section
        title="Tipografía"
        description="IBM Plex Sans para textos, IBM Plex Mono para datos técnicos."
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-baseline gap-4 pb-3 border-b border-ink-100">
              <span className="font-mono text-xs text-ink-400 w-16">6xl</span>
              <h1 className="text-6xl font-semibold">Display</h1>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b border-ink-100">
              <span className="font-mono text-xs text-ink-400 w-16">4xl</span>
              <h1 className="text-4xl font-semibold">Hero / Heading 1</h1>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b border-ink-100">
              <span className="font-mono text-xs text-ink-400 w-16">2xl</span>
              <h2 className="text-2xl font-semibold">Heading 2</h2>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b border-ink-100">
              <span className="font-mono text-xs text-ink-400 w-16">lg</span>
              <p className="text-lg">Subtítulo o párrafo destacado</p>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b border-ink-100">
              <span className="font-mono text-xs text-ink-400 w-16">base</span>
              <p className="text-base">Texto de cuerpo estándar (14px). El más usado.</p>
            </div>
            <div className="flex items-baseline gap-4 pb-3 border-b border-ink-100">
              <span className="font-mono text-xs text-ink-400 w-16">sm</span>
              <p className="text-sm text-ink-500">Texto secundario y descripciones</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-ink-400 w-16">mono</span>
              <p className="font-mono text-base">RFC: HEMP750823AB1 — datos técnicos</p>
            </div>
          </div>
        </Card>
      </Section>

      {/* PALETA */}
      <Section
        title="Paleta de colores"
        description="Brand azul corporativo, ink slate para textos, semánticos para estados."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand */}
          <Card padding="sm">
            <p className="text-sm font-semibold mb-3 text-ink-700">Brand (azul corporativo)</p>
            <div className="space-y-1">
              <ColorRow name="50" hex="#F5F9FF" className="bg-brand-50" />
              <ColorRow name="100" hex="#E6F0FF" className="bg-brand-100" />
              <ColorRow name="500" hex="#1F75FE" className="bg-brand-500" textWhite />
              <ColorRow name="600 *" hex="#0E4DA4" className="bg-brand-600" textWhite />
              <ColorRow name="700" hex="#0B3E83" className="bg-brand-700" textWhite />
              <ColorRow name="900" hex="#051F42" className="bg-brand-900" textWhite />
            </div>
            <p className="text-xs text-ink-500 mt-2 italic">* primario</p>
          </Card>

          {/* Ink */}
          <Card padding="sm">
            <p className="text-sm font-semibold mb-3 text-ink-700">Ink (slate / neutros)</p>
            <div className="space-y-1">
              <ColorRow name="50" hex="#F8FAFC" className="bg-ink-50" />
              <ColorRow name="100" hex="#F1F5F9" className="bg-ink-100" />
              <ColorRow name="300" hex="#CBD5E1" className="bg-ink-300" />
              <ColorRow name="500" hex="#64748B" className="bg-ink-500" textWhite />
              <ColorRow name="700" hex="#334155" className="bg-ink-700" textWhite />
              <ColorRow name="900" hex="#0F172A" className="bg-ink-900" textWhite />
            </div>
          </Card>

          {/* Semánticos */}
          <Card padding="sm" className="md:col-span-2">
            <p className="text-sm font-semibold mb-3 text-ink-700">Semánticos</p>
            <div className="grid grid-cols-3 gap-2">
              <ColorRow name="Success" hex="#00875A" className="bg-success" textWhite />
              <ColorRow name="Warning" hex="#DE7C00" className="bg-warning" textWhite />
              <ColorRow name="Danger" hex="#C9302C" className="bg-danger" textWhite />
            </div>
          </Card>
        </div>
      </Section>

      {/* BOTONES */}
      <Section
        title="Buttons"
        description="4 variantes × 3 tamaños + estados loading y disabled."
      >
        <Card>
          <div className="space-y-6">
            {/* Variantes */}
            <div>
              <p className="text-sm text-ink-500 mb-3">Variantes</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Tamaños */}
            <div>
              <p className="text-sm text-ink-500 mb-3">Tamaños</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Estados */}
            <div>
              <p className="text-sm text-ink-500 mb-3">Estados</p>
              <div className="flex flex-wrap gap-3">
                <Button loading>Cargando...</Button>
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </div>

            {/* Con íconos */}
            <div>
              <p className="text-sm text-ink-500 mb-3">Con íconos (emoji por ahora)</p>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon="📥">Descargar</Button>
                <Button variant="secondary" rightIcon="→">Continuar</Button>
                <Button variant="danger" leftIcon="🗑">Eliminar</Button>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* INPUTS */}
      <Section
        title="Inputs y formularios"
        description="Input, Select, Textarea con labels, errores y hints."
      >
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nombre completo"
              placeholder="Ej: Pedro Hernández"
              hint="Como aparece en su INE"
              value={inputDemo}
              onChange={(e) => setInputDemo(e.target.value)}
            />
            <Input
              label="RFC"
              placeholder="ABCD850101AB1"
              maxLength={13}
              required
              className="font-mono uppercase"
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error="Email inválido"
              defaultValue="texto-invalido"
            />
            <Input
              label="Precio"
              type="number"
              prefix="$"
              suffix="MXN"
              placeholder="1,000.00"
            />
            <Select
              label="Categoría"
              placeholder="Selecciona..."
              value={selectDemo}
              onChange={(e) => setSelectDemo(e.target.value)}
              options={[
                { value: "soldadura", label: "🔧 Soldadura y metalurgia" },
                { value: "refacciones", label: "⚙️ Refacciones industriales" },
                { value: "construccion", label: "🏗️ Construcción civil" },
              ]}
            />
            <Input
              label="Disabled"
              disabled
              defaultValue="No editable"
            />
          </div>
          <div className="mt-5">
            <Textarea
              label="Descripción"
              placeholder="Describe tu empresa..."
              rows={3}
              maxLength={250}
            />
          </div>
        </Card>
      </Section>

      {/* BADGES */}
      <Section
        title="Badges"
        description="Para estados, tiers y categorías."
      >
        <Card>
          <div className="space-y-5">
            <div>
              <p className="text-sm text-ink-500 mb-3">Variantes</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="brand">Brand</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-ink-500 mb-3">Tier de proveedor (preset)</p>
              <div className="flex flex-wrap gap-2">
                <TierBadge tier="bronze" />
                <TierBadge tier="silver" />
                <TierBadge tier="gold" />
              </div>
            </div>

            <div>
              <p className="text-sm text-ink-500 mb-3">Estado de verificación (preset)</p>
              <div className="flex flex-wrap gap-2">
                <EstadoBadge estado="pendiente" />
                <EstadoBadge estado="aprobado" />
                <EstadoBadge estado="rechazado" />
              </div>
            </div>

            <div>
              <p className="text-sm text-ink-500 mb-3">Tamaños</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm" variant="brand">Small</Badge>
                <Badge size="md" variant="brand">Medium</Badge>
                <Badge size="lg" variant="brand">Large</Badge>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* CARDS */}
      <Section
        title="Cards"
        description="Contenedores con variantes default, outlined y elevated."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="Card Default" description="Con borde sutil" />
            <CardBody>
              <p className="text-sm text-ink-600">
                Es la variante más común. Fondo blanco, borde gris claro.
              </p>
            </CardBody>
          </Card>

          <Card variant="outlined">
            <CardHeader title="Card Outlined" description="Sin fondo" />
            <CardBody>
              <p className="text-sm text-ink-600">
                Transparente con borde marcado. Útil sobre fondos coloridos.
              </p>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Card Elevated" description="Con sombra" />
            <CardBody>
              <p className="text-sm text-ink-600">
                Para CTAs y elementos importantes. Da sensación de elevación.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="mt-4">
          <Card>
            <CardHeader
              title="Card con footer y acciones"
              description="Ejemplo más completo con header, body y footer"
              action={<Badge variant="success">Activo</Badge>}
            />
            <CardBody>
              <p className="text-base text-ink-700">
                Esta es la estructura más usada para configuraciones, perfiles, modales,
                etc. Tiene header con título + descripción + acción, body con contenido
                y footer con botones.
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="ghost">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* COMBOS REALES */}
      <Section
        title="Ejemplos combinados"
        description="Cómo se ven los componentes juntos."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Proveedor card preview */}
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Soldaduras del Golfo</h3>
                <p className="font-mono text-xs text-ink-500 mt-0.5">ABCD•••••••••</p>
              </div>
              <TierBadge tier="silver" />
            </div>
            <p className="text-sm text-ink-600 mb-3">
              Servicios de soldadura certificada con 8 años de experiencia en sector hidrocarburos.
            </p>
            <div className="flex items-center gap-3 text-sm text-ink-600 mb-3">
              <span>📍 Coatzacoalcos, Veracruz</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge size="sm" variant="brand">soldadura</Badge>
              <Badge size="sm" variant="brand">metalurgia</Badge>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-ink-200 text-xs">
              <Badge size="sm" variant="success">✓ RFC</Badge>
              <Badge size="sm" variant="success">✓ CSF</Badge>
              <Badge size="sm">🗓 Desde 2018</Badge>
            </div>
          </Card>

          {/* Mini formulario login */}
          <Card>
            <CardHeader
              title="Iniciar sesión"
              description="Accede al directorio de proveedores"
            />
            <CardBody>
              <div className="space-y-3">
                <Button variant="secondary" fullWidth leftIcon="🔵">
                  Continuar con Google
                </Button>
                <div className="text-center text-xs text-ink-400 my-2">— o —</div>
                <Input label="Email" type="email" placeholder="tu@email.com" />
                <Input label="Contraseña" type="password" placeholder="••••••••" />
              </div>
            </CardBody>
            <CardFooter>
              <Button fullWidth>Iniciar sesión</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <div className="text-center text-sm text-ink-400 py-8">
        ✦ Fin del sistema de diseño RQ MARKET v1.0 ✦
      </div>
    </Container>
  );
}

// ── Sub-componente: fila de color ──────────────────────────────────

function ColorRow({
  name,
  hex,
  className,
  textWhite = false,
}: {
  name: string;
  hex: string;
  className: string;
  textWhite?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded ${className} ${
        textWhite ? "text-white" : "text-ink-900"
      }`}
    >
      <span className="text-xs font-medium">{name}</span>
      <span className="text-xs font-mono opacity-75">{hex}</span>
    </div>
  );
}
