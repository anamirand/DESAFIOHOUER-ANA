import { useState, useEffect } from "react";
import axios from "axios";
import "./schools.css"; 

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    carregarEscolas();
  }, []);

  async function carregarEscolas() {
    try {
      const response = await axios.get("http://localhost:5000/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools(response.data.escolas || []);
    } catch (err) {
      console.error("Erro ao carregar escolas:", err);
      setSchools([]);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setError("Selecione um arquivo CSV para enviar.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      await axios.post("http://localhost:5000/schools/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Arquivo importado com sucesso!");
      await carregarEscolas();
    } catch (err) {
      setError("Erro ao importar o arquivo CSV. Verifique se está no formato correto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="schools-page">
      <div className="schools-container">
        <h1 className="title">Instalações Físicas das Escolas</h1>

        {schools.length === 0 ? (
          <div className="upload-section">
            <h2>Importar Lista de Escolas</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar CSV"}
              </button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        ) : (
          <div className="table-section">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Município</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school.id}>
                      <td>{school.id}</td>
                      <td>{school.codesc}</td>
                      <td>{school.nomesc}</td>
                      <td>{school.mun}</td>
                      <td>{school.tipoesc_desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
