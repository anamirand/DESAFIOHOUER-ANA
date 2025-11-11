import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import schoolsRoutes from "./routes/escolas.js";
import { connection } from "./db.js";

connection.query("TRUNCATE TABLE schools", (err) => {
    if (err) {
        console.error("Erro ao limpar tabela ao iniciar>", err);
    } else {
        console.log("Tabela limpa com sucesso ao iniciar o servidor.");
    }
})

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/schools", schoolsRoutes)


app.get("/", (req, res) => {
    res.send("Servirdor está funcionando!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));