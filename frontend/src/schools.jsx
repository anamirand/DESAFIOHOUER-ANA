import React, { useEffect, useState } from "react";

function Schools() {
  const [schools, setSchools] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/schools", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar escolas");
        return res.json();
      })
      .then((data) => setSchools(data))
      .catch((err) => setErro(err.message));
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Lista de Escolas</h1>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      <ul>
        {schools.length > 0 ? (
          schools.map((school) => (
            <li key={school.id}>{school.nomesc}</li>
          ))
        ) : (
          <p>Nenhuma escola encontrada.</p>
        )}
      </ul>
    </div>
  );
}

export default Schools;
