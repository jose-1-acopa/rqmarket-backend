// Paso 1: Layout con Navbar
// src/layout/Layout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
        © 2025 RQ MARKET. Todos los derechos reservados.
      </footer>
    </div>
  );
}
