// src/pages/ReputacionCompleta.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

interface Comentario {
  id: number;
  usuario: string;
  comentario: string;
  calificacion: number;
}

export default function ReputacionCompleta() {
  const navigate = useNavigate();

  const empresa = {
    nombre: "Proveedor ABC S.A.",
    reputacion: 4.5,
    resumen: "Buena reputación basada en 48 opiniones positivas y 2 negativas.",
    comentarios: [
      { id: 1, usuario: "Carlos M.", comentario: "Excelente servicio y tiempos de entrega.", calificacion: 5 },
      { id: 2, usuario: "Lucía R.", comentario: "Todo perfecto, muy recomendable.", calificacion: 5 },
      { id: 3, usuario: "Arturo G.", comentario: "Tuve un problema menor pero lo resolvieron rápido.", calificacion: 4 },
      { id: 4, usuario: "María F.", comentario: "Muy amables y cumplidos.", calificacion: 5 },
      { id: 5, usuario: "David P.", comentario: "Envío tardado, pero producto de calidad.", calificacion: 4 },
    ] as Comentario[],
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {"⭐".repeat(fullStars)}
        {halfStar && "⭐"}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => navigate("/verificacion")}
        style={{
          marginBottom: "1.5rem",
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
        Reputación Completa
      </h1>

      <div style={{
        backgroundColor: "#f8f8f8",
        padding: "2rem",
        borderRadius: "8px",
        marginBottom: "2rem",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{empresa.nombre}</h2>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {renderStars(empresa.reputacion)}
        </div>
        <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>{empresa.resumen}</p>
      </div>

      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Últimos comentarios:</h3>

      <div style={{ display: "grid", gap: "1rem" }}>
        {empresa.comentarios.map((comentario) => (
          <div key={comentario.id} style={{
            backgroundColor: "#ffffff",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              {comentario.usuario} {renderStars(comentario.calificacion)}
            </div>
            <p>{comentario.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
