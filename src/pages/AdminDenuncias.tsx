import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDenuncias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "denuncias"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDenuncias(data);
      } catch (error) {
        console.error("Error al cargar denuncias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDenuncias();
  }, []);

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const denunciaRef = doc(db, "denuncias", id);
      await updateDoc(denunciaRef, { estado: nuevoEstado });
      alert(`✅ Denuncia actualizada a "${nuevoEstado}".`);
      setDenuncias((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: nuevoEstado } : d))
      );
    } catch (error) {
      console.error("Error al actualizar denuncia:", error);
      alert("❌ Error al actualizar denuncia.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Cargando denuncias...</p>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          background: "none",
          border: "none",
          color: "#0055aa",
          fontSize: "0.95rem",
          marginBottom: "20px",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        ← Volver al Dashboard
      </button>

      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Panel de Denuncias</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Denunciante</th>
            <th style={thStyle}>Denunciado</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Acciones</th>
            <th style={thStyle}>Documento</th>
          </tr>
        </thead>
        <tbody>
          {denuncias.map((denuncia) => (
            <tr key={denuncia.id}>
              <td style={tdStyle}>
                {denuncia.createdAt?.toDate().toLocaleDateString() || "-"}
              </td>
              <td style={tdStyle}>{denuncia.nombre || "-"}</td>
              <td style={tdStyle}>{denuncia.denunciado || "-"}</td>
              <td style={tdStyle}>{denuncia.estado}</td>
              <td style={tdStyle}>
                <button
                  onClick={() => actualizarEstado(denuncia.id, "aprobado")}
                  style={btnAprobar}
                >
                  Aprobar
                </button>
                <button
                  onClick={() => actualizarEstado(denuncia.id, "rechazado")}
                  style={btnRechazar}
                >
                  Rechazar
                </button>
              </td>
              <td style={tdStyle}>
                <a
                  href={denuncia.documentoURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "underline" }}
                >
                  Ver Documento
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left" as const,
  fontWeight: "bold" as const,
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const btnAprobar = {
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "5px",
  fontSize: "0.85rem",
};

const btnRechazar = {
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.85rem",
};
