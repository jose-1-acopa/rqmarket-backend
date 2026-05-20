import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // 🔥 Import correcto
import "../styles/ConsultaEstafadores.css";


interface Reporte {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  descripcion: string;
  fechaReporte: any;
}

export default function ConsultaEstafadores() {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estafadores"));
        const data: Reporte[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Reporte[];
        setReportes(data);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      }
    };

    fetchReportes();
  }, []);

  const filteredReportes = reportes.filter((reporte) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      reporte.nombre.toLowerCase().includes(term) ||
      reporte.correo.toLowerCase().includes(term) ||
      reporte.telefono.toLowerCase().includes(term);

    const reporteDate = reporte.fechaReporte?.seconds
      ? new Date(reporte.fechaReporte.seconds * 1000)
      : null;

    const matchesDate =
      (!startDate || (reporteDate && reporteDate >= new Date(startDate))) &&
      (!endDate || (reporteDate && reporteDate <= new Date(endDate)));

    return matchesSearch && matchesDate;
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredReportes.map((reporte) => ({
        Nombre: reporte.nombre,
        Correo: reporte.correo,
        Teléfono: reporte.telefono,
        Descripción: reporte.descripcion,
        "Fecha de Reporte": new Date(reporte.fechaReporte?.seconds * 1000).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reportes");
    XLSX.writeFile(workbook, "reportes_estafadores.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Nombre", "Correo", "Teléfono", "Descripción", "Fecha de Reporte"];
    const tableRows: any[] = [];

    filteredReportes.forEach((reporte) => {
      const reporteData = [
        reporte.nombre,
        reporte.correo,
        reporte.telefono,
        reporte.descripcion,
        new Date(reporte.fechaReporte?.seconds * 1000).toLocaleDateString(),
      ];
      tableRows.push(reporteData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("reportes_estafadores.pdf");
  };

  return (
    <div className="consulta-estafadores-container" style={{ padding: "2rem" }}>
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
        Consulta de Estafadores
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

      {/* Filtros de fecha */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>

      {/* Botones de exportación */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <button
          onClick={exportToExcel}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📋 Descargar Excel
        </button>
        <button
          onClick={exportToPDF}
          style={{
            backgroundColor: "#2196F3",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📄 Descargar PDF
        </button>
      </div>

      {/* Alerta si hay resultados */}
      {filteredReportes.length > 0 && (
        <div
          style={{
            backgroundColor: "#ffe0e0",
            color: "#b20000",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontWeight: "bold",
          }}
        >
          ⚠️ ¡Cuidado! Hay reportes de estafa relacionados con tu búsqueda.
        </div>
      )}

      {/* Mostrar cantidad de resultados */}
      <p style={{ marginBottom: "1rem", fontWeight: "bold" }}>
        {filteredReportes.length} reporte(s) encontrado(s)
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
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Fecha de Reporte</th>
            </tr>
          </thead>
          <tbody>
            {filteredReportes.length > 0 ? (
              filteredReportes.map((reporte) => (
                <tr key={reporte.id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{reporte.nombre}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{reporte.correo}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{reporte.telefono}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{reporte.descripcion}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(reporte.fechaReporte?.seconds * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "10px" }}>
                  No se encontraron reportes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
