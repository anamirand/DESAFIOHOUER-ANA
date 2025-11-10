import authRoutes from "./routes/auth.js";
import express from "express";
import cors from "cors";
import { connection as db } from './db.js';
import schoolsRoutes from "./routes/escolas.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/schools", schoolsRoutes)

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Servirdor está funcionando!");
});


app.listen(5000, () => console.log ("Servidor rodando na porta 5000."));
