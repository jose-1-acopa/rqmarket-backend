/**
 * Equipo.tsx
 * Gestión de equipo de una organización (plan Empresa, Fase D). SOLO admin.
 *
 *   - Invitar miembros (email + rol) con límite de asientos visible.
 *   - Listar miembros y cambiar su rol / quitarlos.
 *   - Listar invitaciones pendientes con su link para compartir.
 *
 * La barrera real es server-side (soloPlanEmpresa + soloRolOrg(['admin'])).
 * Esto solo decide qué se muestra.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Trash2,
  UserPlus,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import {
  listarEquipo,
  invitarMiembro,
  cambiarRolMiembro,
  quitarMiembro,
  type EquipoResponse,
  type RolOrgApi,
} from "../services/rqmarketApi";
import { Input, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";

const ROLES: { value: RolOrgApi; label: string }[] = [
  { value: "compras", label: "Compras" },
  { value: "ventas", label: "Ventas" },
  { value: "admin", label: "Admin" },
];

function linkInvitacion(token: string): string {
  return `${window.location.origin}/aceptar-invitacion?token=${token}`;
}

export default function Equipo() {
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth, planTipo, esAdminOrg } = useAuth();

  const [equipo, setEquipo] = useState<EquipoResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolOrgApi>("compras");
  const [invitando, setInvitando] = useState(false);
  const [errorInvitar, setErrorInvitar] = useState<string | null>(null);
  const [accionUid, setAccionUid] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  // ── Auth guard ──
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/equipo" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  const esEmpresaAdmin = planTipo === "empresa" && esAdminOrg;

  const recargar = () => {
    setCargando(true);
    setError(null);
    listarEquipo()
      .then((e) => {
        setEquipo(e);
        setCargando(false);
      })
      .catch((err) => {
        setError(err?.message || "No se pudo cargar tu equipo");
        setCargando(false);
      });
  };

  useEffect(() => {
    if (cargandoAuth || !usuario || !esEmpresaAdmin) {
      setCargando(false);
      return;
    }
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, cargandoAuth, esEmpresaAdmin]);

  const handleInvitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInvitar(null);
    if (!email.trim()) return;
    setInvitando(true);
    try {
      await invitarMiembro({ email: email.trim(), org_rol: rol });
      setEmail("");
      setRol("compras");
      recargar();
    } catch (err: any) {
      setErrorInvitar(err?.message || "No se pudo enviar la invitación");
    } finally {
      setInvitando(false);
    }
  };

  const handleCambiarRol = async (uid: string, nuevoRol: RolOrgApi) => {
    setAccionUid(uid);
    setError(null);
    try {
      await cambiarRolMiembro(uid, nuevoRol);
      recargar();
    } catch (err: any) {
      setError(err?.message || "No se pudo cambiar el rol");
    } finally {
      setAccionUid(null);
    }
  };

  const handleQuitar = async (uid: string, nombre: string) => {
    if (!window.confirm(`¿Quitar a ${nombre} de la organización?`)) return;
    setAccionUid(uid);
    setError(null);
    try {
      await quitarMiembro(uid);
      recargar();
    } catch (err: any) {
      setError(err?.message || "No se pudo quitar al miembro");
    } finally {
      setAccionUid(null);
    }
  };

  const copiar = async (token: string) => {
    try {
      await navigator.clipboard.writeText(linkInvitacion(token));
      setCopiado(token);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      /* clipboard no disponible: no-op */
    }
  };

  // ── Estados de carga / acceso ──
  if (cargandoAuth || (cargando && esEmpresaAdmin)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Loader2 size={18} className="animate-spin mr-2" />
        Cargando tu equipo…
      </div>
    );
  }
  if (!usuario) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Lock size={18} className="mr-2" />
        Redirigiendo a inicio de sesión…
      </div>
    );
  }
  if (!esEmpresaAdmin) {
    return (
      <div className="bg-ink-50 min-h-screen py-16 px-4">
        <div className="max-w-xl mx-auto bg-white border border-ink-200 rounded p-8 sm:p-10 text-center shadow-card">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink-100 text-ink-500 border border-ink-200">
            <Users size={26} strokeWidth={1.25} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink-900">
            Gestión de equipo
          </h2>
          <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
            La gestión de equipo es exclusiva del <strong>plan Empresa</strong> y
            solo el administrador de la organización puede acceder.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
          >
            Volver al dashboard
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const asientosLlenos = !!equipo && equipo.asientos_ocupados >= equipo.asientos_max;

  return (
    <div className="bg-ink-50 min-h-screen">
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
              Plan Empresa
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
              Tu equipo
            </h1>
          </div>
          {equipo && (
            <span className="font-mono text-sm text-ink-700 tabular-nums px-3 py-1.5 rounded border border-ink-200 bg-white">
              {equipo.asientos_ocupados} / {equipo.asientos_max} asientos
            </span>
          )}
        </Reveal>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Invitar */}
        <div className="bg-white border border-ink-200 rounded p-6 shadow-card">
          <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
            <UserPlus size={18} className="text-brand-700" />
            Invitar a un miembro
          </h2>
          {asientosLlenos ? (
            <p className="mt-3 text-sm text-warning">
              Alcanzaste el límite de {equipo?.asientos_max} asientos. Quita un miembro
              o una invitación pendiente para invitar a alguien más.
            </p>
          ) : (
            <form onSubmit={handleInvitar} className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-3 items-end">
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="persona@empresa.com"
              />
              <Select
                label="Rol"
                name="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value as RolOrgApi)}
                options={ROLES}
              />
              <Button type="submit" loading={invitando} leftIcon={!invitando ? <Mail size={16} /> : undefined}>
                {invitando ? "Enviando…" : "Invitar"}
              </Button>
            </form>
          )}
          {errorInvitar && (
            <div className="mt-3 bg-danger-bg border border-danger-border text-danger px-3 py-2 rounded flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span className="text-xs">{errorInvitar}</span>
            </div>
          )}
        </div>

        {/* Miembros */}
        <div className="bg-white border border-ink-200 rounded shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-200">
            <h2 className="text-lg font-semibold text-ink-900">Miembros</h2>
          </div>
          <ul className="divide-y divide-ink-100">
            {equipo?.miembros.map((m) => {
              const esYo = m.uid === usuario.uid;
              const enCurso = accionUid === m.uid;
              return (
                <li key={m.uid} className="px-6 py-4 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold shrink-0">
                    {(m.nombre || m.email || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-900 truncate">
                      {m.nombre || m.email}{esYo && <span className="text-ink-400 font-normal"> (tú)</span>}
                    </div>
                    <div className="text-xs text-ink-500 truncate">{m.email}</div>
                  </div>
                  <Select
                    name={`rol-${m.uid}`}
                    value={m.org_rol || "compras"}
                    onChange={(e) => handleCambiarRol(m.uid, e.target.value as RolOrgApi)}
                    disabled={enCurso}
                    options={ROLES}
                    fullWidth={false}
                    className="w-[120px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuitar(m.uid, m.nombre || m.email || "este miembro")}
                    disabled={enCurso}
                    className="inline-flex items-center justify-center w-9 h-9 rounded border border-ink-200 text-ink-500 hover:text-danger hover:border-danger-border disabled:opacity-50 transition-colors focus:outline-none focus-visible:shadow-focus"
                    aria-label="Quitar miembro"
                    title="Quitar de la organización"
                  >
                    {enCurso ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Invitaciones pendientes */}
        {equipo && equipo.invitaciones.length > 0 && (
          <div className="bg-white border border-ink-200 rounded shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-200">
              <h2 className="text-lg font-semibold text-ink-900">Invitaciones pendientes</h2>
            </div>
            <ul className="divide-y divide-ink-100">
              {equipo.invitaciones.map((i) => (
                <li key={i.token} className="px-6 py-4 flex items-center gap-3 flex-wrap">
                  <Mail size={16} className="text-ink-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink-900 truncate">{i.email}</div>
                    <div className="text-xs text-ink-500">
                      Rol: {i.org_rol}
                      {i.expira ? ` · expira ${new Date(i.expira).toLocaleDateString("es-MX")}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copiar(i.token)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-ink-200 text-sm text-ink-700 hover:bg-ink-50 transition-colors focus:outline-none focus-visible:shadow-focus"
                  >
                    {copiado === i.token ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    {copiado === i.token ? "Copiado" : "Copiar link"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
