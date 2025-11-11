import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
console.log("🔑 JWT_SECRET carregado:", process.env.JWT_SECRET);

const SECRET = process.env.JWT_SECRET || "meusegredoseguro";

export function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    console.log("Authorization header recebido:", authHeader);

    if(!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split (" ")[1];
    if (!token) {
    return res.status(401).json({ erro: "Token ausente ou inválido" });
  }

  try {
    const usuario = jwt.verify(token, SECRET);
    req.usuario = usuario;
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err.message);
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}