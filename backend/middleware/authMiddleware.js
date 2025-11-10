import jwt from "jsonwebtoken";

const SECRET = "meusegredoseguro";

export function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    console.log("Authorization header recebido:", req.headers["authorization"]);

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido"});
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ erro: "Token ausente ou inválido" });
    }

    jwt.verify(token, SECRET, (err, usuario) => {
        if (err) {
            return res.status(403).json({ erro: "Token inválido ou expirado"});
        }

        req.usuario = usuario;
        next();
    });
}