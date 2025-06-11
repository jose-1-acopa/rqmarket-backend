import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Servicios from "./pages/Servicios";
import Modelos from "./pages/Modelos";
import Verificacion from "./pages/Verificacion";
import Denuncia from "./pages/Denuncia";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Nosotros from "./pages/Nosotros";
import Precios from "./pages/Precios";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import AdminDenuncias from "./pages/AdminDenuncias";
import ConsultaEstafadores from "./pages/ConsultaEstafadores";
import EmpresasVerificadas from "./pages/EmpresasVerificadas";
import ReputacionTransparente from "./pages/ReputacionTransparente"; // ✅ aquí
import ReputacionCompleta from "./pages/ReputacionCompleta"; // ✅ aquí
import ServicioCompleto from "./pages/ServicioCompleto";
import AdminRequisiciones from "./pages/AdminRequisiciones";




export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/modelos" element={<Modelos />} />
          <Route path="/verificacion" element={<Verificacion />} />
          <Route path="/verificacion/denuncia" element={<Denuncia />} />
          <Route path="/verificacion/consulta-estafadores" element={<ConsultaEstafadores />} />
          <Route path="/verificacion/empresas-verificadas" element={<EmpresasVerificadas />} />
          <Route path="/verificacion/reputacion" element={<ReputacionTransparente />} /> {/* ✅ Reputación previa */}
          <Route path="/verificacion/reputacion-completa" element={<ReputacionCompleta />} /> {/* ✅ Reputación completa */}
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/denuncias" element={<AdminDenuncias />} />
          <Route path="/servicio-completo" element={<ServicioCompleto />} />
          <Route path="/admin/requisiciones" element={<AdminRequisiciones />} />


        </Routes>

        <footer className="mt-16 py-6 border-t text-sm text-center text-gray-500">
          © 2025 RQ MARKET. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
