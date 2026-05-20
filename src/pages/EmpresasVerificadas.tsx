import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../styles/EmpresasVerificadas.css";


interface Empresa {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  descripcion: string;
  fechaVerificacion: any;
}

export default function EmpresasVerificadas() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "empresasVerificadas"));
        const data: Empresa[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Empresa[];
        setEmpresas(data);
      } catch (error) {
        console.error("Error al cargar empresas:", error);
      }
    };

    fetchEmpresas();
  }, []);

  const filteredEmpresas = empresas.filter((empresa) => {
    const term = searchTerm.toLowerCase();
    return (
      empresa.nombre.toLowerCase().includes(term) ||
      empresa.correo.toLowerCase().includes(term) ||
      empresa.telefono.toLowerCase().includes(term)
    );
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredEmpresas.map(({ id, ...rest }) => rest));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas Verificadas");
    XLSX.writeFile(workbook, "empresas_verificadas.xlsx");
  };

  return (
    <div className="empresas-verificadas-container" style={{ padding: "2rem" }}>
      <button
        onClick={() => navigate("/verificacion")}
        style={{
          marginBottom: "1rem",
          backgroundColor: "#e0e0e0",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Volver a Verificación
      </button>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Empresas Verificadas
      </h1>

      {/* Input de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre, correo o teléfono..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          width: "100%",
          maxWidth: "500px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {/* Botón de descarga */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={exportToExcel}
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📥 Descargar Excel
        </button>
      </div>

      {/* Mostrar cantidad de resultados */}
      <p style={{ marginBottom: "1rem", fontWeight: "bold" }}>
        {filteredEmpresas.length} empresa(s) encontrada(s)
      </p>

      {/* Tabla de resultados */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Nombre</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Correo</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Teléfono</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Descripción</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Fecha de Verificación</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpresas.length > 0 ? (
              filteredEmpresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{empresa.nombre}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{empresa.correo}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{empresa.telefono}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{empresa.descripcion}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(empresa.fechaVerificacion?.seconds * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "10px" }}>
                  No se encontraron empresas verificadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
