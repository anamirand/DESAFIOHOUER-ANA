import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { connection } from "../db.js";

dotenv.config();

const router = express.Router ();
const SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Campos obrigatórios: nome, email, senha" });
    }

    try {

    const hash = await bcrypt.hash(senha, 10);

    const sql = "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)";

    connection.query(sql, [nome, email, hash], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ erro: "Email já cadastrado" });
            }
            return res.status(500).json({ erro: "Erro ao registrar usuário", delalhes: err});
        }

        res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
    });

    } catch (error) {
        res.status(500).json({ erro: "Erro interno no servidor", detalhes: error});
        }
});

router.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Informe email e senha" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar usuário", detalhes: err });

        if (results.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const user = results[0];
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha incorreta" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

        res.json({ mensagem: "Login realizado com sucesso!", token});
    });
});

export default router;