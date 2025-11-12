import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./schools.css";
import { Plus } from "lucide-react";

export default function Schools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [arquivoExistente, setArquivoExistente] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const LIMITE = 100;
  const MAIN_FIELDS = ["codesc", "nomesc", "mun", "tipoesc_desc"];

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    carregarEscolas();
  }, [pagina]);

  async function carregarEscolas() {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/schools?pagina=${pagina}&limite=${LIMITE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let lista = res.data?.escolas || [];
      lista.sort((a, b) => b.id - a.id); 
      setSchools(lista);
      setTotalPaginas(Math.max(1, Math.ceil((res.data?.total ?? lista.length) / LIMITE)));
      setError("");
    } catch (err) {
      console.error("Erro ao carregar escolas:", err);
      setError("Erro ao carregar escolas.");
      setSchools([]);
    } finally {
      setLoading(false);
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
    setArquivoExistente(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const res = await axios.post("http://localhost:5000/schools/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.mensagem?.toLowerCase().includes("já")) {
        setArquivoExistente(true);
        setSuccess("Este arquivo já está registrado no banco de dados.");
        mostrarToast("Arquivo já está no banco.", true);
      } else {
        setSuccess("Arquivo importado com sucesso!");
        mostrarToast("Importação feita com sucesso.");
        setPagina(1);
        setTimeout(() => carregarEscolas(), 1000);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao importar o CSV. Verifique o formato do arquivo.");
      mostrarToast("Erro ao importar CSV.", true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir esta escola?")) return;
    try {
      await axios.delete(`http://localhost:5000/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mostrarToast("Escola excluída com sucesso.");
      carregarEscolas();
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao excluir escola.", true);
    }
  }

  async function abrirDetalhes(id) {
    try {
      const res = await axios.get(`http://localhost:5000/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedSchool(res.data);
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao carregar informações da escola.", true);
    }
  }

  function abrirCriar() {
    setEditData({
      codesc: "",
      nomesc: "",
      mun: "",
      tipoesc_desc: "",
    });
    setShowEditModal(true);
  }

  async function handleEdit(id) {
    try {
      const res = await axios.get(`http://localhost:5000/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditData(res.data);
      setShowEditModal(true);
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao carregar dados para edição.", true);
    }
  }

  async function salvarEdicao() {
    if (!editData) return;

    if (
      !editData.codesc?.toString().trim() ||
      !editData.nomesc?.toString().trim() ||
      !editData.mun?.toString().trim() ||
      !editData.tipoesc_desc?.toString().trim()
    ) {
      mostrarToast("Preencha os campos obrigatórios.", true);
      return;
    }

    try {
      if (editData.id) {
        await axios.put(`http://localhost:5000/schools/${editData.id}`, editData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        mostrarToast("Escola atualizada com sucesso!");
      } else {
        const res = await axios.post(`http://localhost:5000/schools`, editData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const novaEscola = {
          ...editData,
          id: res.data?.id || Date.now(),
        };
        setSchools((prev) => [novaEscola, ...prev]);
        mostrarToast("Escola adicionada com sucesso!");
      }

      setShowEditModal(false);
      setEditData(null);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      mostrarToast("Erro ao salvar alterações.", true);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function mostrarToast(msg, erro = false) {
    setToast({ msg, erro });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="schools-page">
      <div className="top-bar">
        <h1>Instalações Físicas das Escolas</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }}
        >
          Sair
        </button>
      </div>

      <div className="schools-container">
        <div className="action-row">
          <button className="adicionar" onClick={abrirCriar}>
            + Adicionar Escola
          </button>

          <form onSubmit={handleUpload} className="upload-inline-form">
            <label className="upload-wrapper">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <span>Escolher Arquivo CSV</span>
            </label>
            <button type="submit" className="upload-submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar CSV"}
            </button>
          </form>
        </div>

        {arquivoExistente && <p className="success">Este arquivo já está registrado no banco.</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="table-section">
          {loading ? (
            <p className="loading">Carregando...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  {MAIN_FIELDS.map((col) => (
                    <th key={col}>{col.toUpperCase()}</th>
                  ))}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={MAIN_FIELDS.length + 3} style={{ textAlign: "center", color: "#666" }}>
                      Nenhum dado encontrado no banco.
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => (
                    <tr key={school.id}>
                      <td style={{ textAlign: "center", cursor: "pointer" }}>
                        <Plus size={18} onClick={() => abrirDetalhes(school.id)} />
                      </td>
                      <td>{school.id}</td>
                      {MAIN_FIELDS.map((col) => (
                        <td key={col}>{school[col]}</td>
                      ))}
                      <td className="acoes">
                        <button className="editar" onClick={() => handleEdit(school.id)}>
                          Editar
                        </button>
                        <button className="excluir" onClick={() => handleDelete(school.id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {schools.length > 0 && (
          <div className="pagination">
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}>
              Anterior
            </button>
            <span>Página {pagina} de {totalPaginas}</span>
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
              Próxima
            </button>
          </div>
        )}
      </div>

      {selectedSchool && (
        <div className="modal-overlay" onClick={() => setSelectedSchool(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Detalhes da Escola: {selectedSchool.nomesc}</h2>
            <div className="modal-content" style={{ gap: "16px" }}>
              {Object.entries(selectedSchool).map(([key, value]) => (
                <div key={key} className="modal-field">
                  <label>{key.toUpperCase()}</label>
                  <input type="text" value={value || "—"} readOnly />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="cancelar" onClick={() => setSelectedSchool(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editData && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editData.id ? "Editar Escola" : "Adicionar Nova Escola"}</h2>
            <div className="modal-content" style={{ gap: "20px" }}>
              {Object.entries(editData).map(([key, value]) => (
                <div key={key} className="modal-field">
                  <label>
                    {key.toUpperCase()}{" "}
                    {["codesc", "nomesc", "mun", "tipoesc_desc"].includes(key) && (
                      <span style={{ color: "red" }}>*</span>
                    )}
                  </label>
                  <input name={key} value={value || ""} onChange={handleInputChange} />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="salvar" onClick={salvarEdicao}>
                Salvar
              </button>
              <button className="cancelar" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: toast.erro ? "#e74c3c" : "#2ecc71",
            color: "white",
            padding: "14px 20px",
            borderRadius: "8px",
            fontWeight: "500",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 4000,
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
