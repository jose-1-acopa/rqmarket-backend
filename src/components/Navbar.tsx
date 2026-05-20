import { Link } from "react-router-dom";
import { useState } from "react";
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
  <img src="/img/logo.png" alt="RQ MARKET" className="navbar-img" />
</Link>

      <nav className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/servicios">Servicios</Link>
        <Link to="/modelos">Modelos</Link>
        <Link to="/verificacion">Verificación</Link>
        <Link to="/contacto">Contacto</Link>
      </nav>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
    </header>
  );
}
