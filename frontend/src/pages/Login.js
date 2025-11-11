
import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");

        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error (data.erro || "Falha no login");
            }

            localStorage.setItem("token", data.token);
            alert("Login realizado com sucesso!")

            window.location.href = "/Schools";
        } catch (err) {
            setErro(err.message);
        }
    };

    return (
  <div className="login-container">
    <h1>Desafio Técnico</h1>
    <h2>Entrar no Sistema</h2>

    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
    </form>

    {erro && <p style={{ color: "red" }}>{erro}</p>}

    <p>
      Esqueceu sua senha? <a href="#">Recuperar</a>
    </p>
  </div>
);

}

export default Login;
