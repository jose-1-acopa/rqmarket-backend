import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, ShieldCheck, LogOut, FileText, FilePlus2, CreditCard } from "lucide-react";
import { useAuth } from "../firebase/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, esAdmin, logout, cargando } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Error en logout:", err);
    }
  };

  const navLinks = [
    { to: "/", label: "Inicio", exact: true },
    { to: "/directorio", label: "Directorio" },
    { to: "/rfqs", label: "RFQs" },
    { to: "/precios", label: "Precios" },
    { to: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink-200">
      <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo + tagline */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="RQ MARKET - Inicio">
          <img src="/img/logo.png" alt="" className="h-8 w-auto" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-500 group-hover:text-brand-700 transition-colors">
              Verificación B2B industrial
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium transition-colors border-l border-ink-200 first:border-l-0 ${
                  isActive ? "text-brand-700" : "text-ink-700 hover:text-ink-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-px left-4 right-4 h-0.5 bg-brand-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="border-l border-ink-200 ml-2 pl-4">
            {!cargando && (usuario ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded border border-ink-200 bg-white hover:bg-ink-50 text-sm font-medium text-ink-800 transition-colors focus:outline-none focus-visible:shadow-focus"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                    {(usuario.nombre || usuario.email || "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[140px] truncate">{usuario.nombre || usuario.email}</span>
                  {esAdmin && (
                    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
                      Admin
                    </span>
                  )}
                  <ChevronDown size={14} className={`text-ink-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] min-w-[220px] bg-white border border-ink-200 rounded shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-ink-100">
                      <div className="text-xs font-mono uppercase tracking-wider text-ink-500">Sesión</div>
                      <div className="text-sm text-ink-800 truncate">{usuario.email}</div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-ink-500" />
                      Mi dashboard
                    </Link>
                    <Link
                      to="/mis-rfqs"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      <FileText size={16} className="text-ink-500" />
                      Mis RFQs
                    </Link>
                    <Link
                      to="/publicar-rfq"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      <FilePlus2 size={16} className="text-ink-500" />
                      Publicar RFQ
                    </Link>
                    <Link
                      to="/mi-suscripcion"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      <CreditCard size={16} className="text-ink-500" />
                      Mi suscripción
                    </Link>
                    {esAdmin && (
                      <Link
                        to="/admin/proveedores"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                      >
                        <ShieldCheck size={16} className="text-ink-500" />
                        Panel admin
                      </Link>
                    )}
                    <div className="border-t border-ink-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-ink-50 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center h-9 px-4 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Iniciar sesión
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded text-ink-700 hover:bg-ink-100 focus:outline-none focus-visible:shadow-focus"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile side panel */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-ink-900/40 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed top-14 right-0 bottom-0 w-72 max-w-[85vw] bg-white border-l border-ink-200 z-50 overflow-y-auto">
            <nav className="flex flex-col py-2" aria-label="Navegación móvil">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.exact}
                  className={({ isActive }) =>
                    `px-5 py-3 text-base font-medium border-l-2 transition-colors ${
                      isActive
                        ? "text-brand-700 border-brand-600 bg-brand-50/50"
                        : "text-ink-700 border-transparent hover:bg-ink-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="border-t border-ink-200 mt-2 pt-2">
                {!cargando && (usuario ? (
                  <>
                    <div className="px-5 py-3 bg-ink-50/50">
                      <div className="text-xs font-mono uppercase tracking-wider text-ink-500">Sesión</div>
                      <div className="text-sm text-ink-800 truncate mt-0.5">{usuario.email}</div>
                      {esAdmin && (
                        <span className="inline-block mt-1.5 font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-5 py-3 text-base text-ink-700 hover:bg-ink-50 transition-colors">
                      <LayoutDashboard size={18} className="text-ink-500" />
                      Mi dashboard
                    </Link>
                    <Link to="/mis-rfqs" className="flex items-center gap-3 px-5 py-3 text-base text-ink-700 hover:bg-ink-50 transition-colors">
                      <FileText size={18} className="text-ink-500" />
                      Mis RFQs
                    </Link>
                    <Link to="/publicar-rfq" className="flex items-center gap-3 px-5 py-3 text-base text-ink-700 hover:bg-ink-50 transition-colors">
                      <FilePlus2 size={18} className="text-ink-500" />
                      Publicar RFQ
                    </Link>
                    <Link to="/mi-suscripcion" className="flex items-center gap-3 px-5 py-3 text-base text-ink-700 hover:bg-ink-50 transition-colors">
                      <CreditCard size={18} className="text-ink-500" />
                      Mi suscripción
                    </Link>
                    {esAdmin && (
                      <Link to="/admin/proveedores" className="flex items-center gap-3 px-5 py-3 text-base text-ink-700 hover:bg-ink-50 transition-colors">
                        <ShieldCheck size={18} className="text-ink-500" />
                        Panel admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-base text-danger hover:bg-ink-50 transition-colors text-left"
                    >
                      <LogOut size={18} />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="px-5 py-3">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center w-full h-11 px-4 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-base font-medium transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
