import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./Denuncia.css";

export default function Denuncia() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);
      const nombre = formData.get("nombre") as string;
      const correo = formData.get("correo") as string;
      const telefono = formData.get("telefono") as string;
      const denunciado = formData.get("denunciado") as string;
      const descripcion = formData.get("descripcion") as string;
      const numero_averiguacion = formData.get("numero_averiguacion") as string;
      const fecha_denuncia = formData.get("fecha_denuncia") as string;

      if (!file) {
        alert("Por favor, sube un documento antes de enviar.");
        setLoading(false);
        return;
      }

      const storageRef = ref(storage, `denuncias/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error al subir archivo:", error);
          alert("❌ Error al subir archivo. Inténtalo de nuevo.");
          setLoading(false);
        },
        async () => {
          const fileURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "denuncias"), {
            nombre,
            correo,
            telefono,
            denunciado,
            descripcion,
            numero_averiguacion,
            fecha_denuncia,
            documentoURL: fileURL,
            estado: "pendiente",
            createdAt: Timestamp.now()
          });

          alert("✅ Denuncia enviada correctamente. Será revisada por nuestro equipo.");
          navigate("/verificacion");
        }
      );
    } catch (error) {
      console.error(error);
      alert("❌ Error general al enviar la denuncia. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="denuncia-container">
      <button
        onClick={() => navigate("/verificacion")}
        className="btn-volver"
      >
        ← Volver a Verificación
      </button>

      <h1>Formulario de Denuncia en Línea</h1>
      <p className="aviso-legal">
        ⚖️ Para proteger la integridad de terceros, sólo aceptamos denuncias acompañadas de documentación oficial emitida por el Ministerio Público. Toda denuncia será verificada antes de ser publicada.
      </p>

      <form className="denuncia-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tu nombre completo:</label>
          <input type="text" name="nombre" required />
        </div>

        <div className="form-group">
          <label>Correo electrónico de contacto:</label>
          <input type="email" name="correo" required />
        </div>

        <div className="form-group">
          <label>Teléfono de contacto (opcional):</label>
          <input type="tel" name="telefono" />
        </div>

        <div className="form-group">
          <label>Nombre de empresa o persona denunciada:</label>
          <input type="text" name="denunciado" required />
        </div>

        <div className="form-group">
          <label>Breve descripción de los hechos:</label>
          <textarea name="descripcion" rows={5} required></textarea>
        </div>

        <div className="form-group">
          <label>Número de averiguación previa o carpeta de investigación:</label>
          <input type="text" name="numero_averiguacion" required />
        </div>

        <div className="form-group">
          <label>Fecha de la denuncia oficial:</label>
          <input type="date" name="fecha_denuncia" required />
        </div>

        <div className="form-group">
          <label>Subir documento oficial de denuncia (PDF o imagen):</label>
          <input
            type="file"
            name="documento"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            onChange={handleFileChange}
          />
        </div>

        {loading && (
          <div className="form-group">
            <label>Subiendo archivo: {uploadProgress.toFixed(0)}%</label>
            <progress value={uploadProgress} max="100" style={{ width: "100%" }} />
          </div>
        )}

        <div className="form-group declaracion-legal">
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <input
              type="checkbox"
              required
              name="confirmacion_legal"
              style={{ marginTop: "5px" }}
            />
            <span>
              ⚠️ <strong>Declaro bajo protesta de decir verdad</strong> que la información proporcionada es verídica y está sustentada en documentación oficial. Entiendo que enviar información falsa puede tener consecuencias legales.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="btn-enviar"
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Enviando denuncia..." : "Enviar denuncia"}
        </button>
      </form>
    </div>
  );
}
