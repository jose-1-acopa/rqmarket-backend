import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../firebase/AuthContext";
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { usuario, esAdmin, logout, cargando } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Error en logout:", err);
    }
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/img/logo.png" alt="RQ MARKET" className="navbar-img" />
      </Link>

      <nav className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/directorio">Directorio</Link>
        <Link to="/servicios">Servicios</Link>
        <Link to="/modelos">Modelos</Link>
        <Link to="/verificacion">Verificación</Link>
        <Link to="/contacto">Contacto</Link>

        {/* Sección de usuario / login */}
        {!cargando && (
          <>
            {usuario ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>👤</span>
                  <span>{usuario.nombre || usuario.email}</span>
                  {esAdmin && (
                    <span
                      style={{
                        background: "#dbeafe",
                        color: "#1e40af",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      Admin
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      minWidth: "200px",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 14px",
                        color: "#374151",
                        textDecoration: "none",
                        fontSize: "14px",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      📊 Mi dashboard
                    </Link>
                    {esAdmin && (
                      <Link
                        to="/admin/proveedores"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "10px 14px",
                          color: "#374151",
                          textDecoration: "none",
                          fontSize: "14px",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        🛡️ Panel admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 14px",
                        background: "transparent",
                        border: "none",
                        color: "#dc2626",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                Iniciar sesión
              </Link>
            )}
          </>
        )}
      </nav>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
    </header>
  );
}
