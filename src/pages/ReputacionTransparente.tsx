import React from "react";
import { useNavigate } from "react-router-dom";

interface Empresa {
  nombre: string;
  reputacion: number;
  resumen: string;
}

export default function ReputacionTransparente() {
  const navigate = useNavigate();

  const empresa: Empresa = {
    nombre: "Proveedor ABC S.A.",
    reputacion: 4.2,
    resumen: "Buena reputación basada en reseñas verificadas.",
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
        Reputación Transparente
      </h1>

      <div
        style={{
          backgroundColor: "#f8f8f8",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{empresa.nombre}</h2>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {renderStars(empresa.reputacion)}
        </div>
        <p style={{ marginBottom: "2rem" }}>{empresa.resumen}</p>

        <button
          onClick={() => navigate("/modelos")}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          🔒 Ver reputación completa
        </button>
      </div>
    </div>
  );
}
