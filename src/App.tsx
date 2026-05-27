import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";

// Páginas
import Home from "./pages/Home";
import Directorio from "./pages/Directorio";
import LoginPage from "./pages/LoginPage";
import RegistroProveedor from "./pages/RegistroProveedor";
import AdminProveedores from "./pages/AdminProveedores";
import Dashboard from "./pages/Dashboard";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Precios from "./pages/Precios";
import SistemaDiseno from "./pages/SistemaDiseno";
import RFQs from "./pages/RFQs";
import RFQDetalle from "./pages/RFQDetalle";
import PublicarRFQ from "./pages/PublicarRFQ";
import MisRFQs from "./pages/MisRFQs";
import MiSuscripcion from "./pages/MiSuscripcion";

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/directorio" element={<Directorio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/sistema-diseno" element={<SistemaDiseno />} />
          <Route path="/rfqs" element={<RFQs />} />
          <Route path="/rfqs/:id" element={<RFQDetalle />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Requiere login */}
          <Route path="/registro-proveedor" element={<RegistroProveedor />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/publicar-rfq" element={<PublicarRFQ />} />
          <Route path="/mis-rfqs" element={<MisRFQs />} />
          <Route path="/mi-suscripcion" element={<MiSuscripcion />} />

          {/* Admin */}
          <Route path="/admin/proveedores" element={<AdminProveedores />} />
        </Routes>

        <footer className="mt-16 py-6 border-t text-sm text-center text-gray-500">
          © 2026 RQ MARKET. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
