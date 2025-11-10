import { verificarToken } from "../middleware/authMiddleware.js"
import express from "express";
import { connection } from "../db.js";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { dir } from "console";

const router = express.Router();

router.use(verificarToken);

router.get("/test", (req, res) => {
    connection.query("SELECT 1 + 1 AS resultado", (err, results) => {
        if (err) {
            return res.status(500).json({ erro: "Erro no MySql", detalhes: err});
        }
        res.json({ mensagem: "MySQL está funcionando!", resultado: results[0].resultado });
    });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;

    const query = "SELECT * FROM schools WHERE id = ?";

    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                erro: "Erro ao buscar escola pelo ID",
                detalhes: err
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ mensagem: "Escola não encontrada" });
        }

        res.json(results[0]);
    });
})

const upload = multer({ dest: "uploads/"});

router.post("/upload", upload.single("arquivo"), (req, res) => {
    const results =[];
    const caminho = req.file.path;

    fs.createReadStream(caminho)
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => results.push(data))
    .on("end", () => {

        const valores = results.map((linha) => [
            linha.CODESC,
            linha.NOMESC,
            linha.MUN,
            linha.NOMEDEP,
            linha.TIPOESC
        ]);

        const sql = `
            INSERT INTO schools (codesc, nomesc, mun, diretoria, tipoesc)
            VALUES ?
        `;

        connection.query(sql, [valores], (err) => {
            if (err) {
                console.error("Erro ao inserir dados:", err);
                return res.status(500).json({ erro: "Falha ao importar CSV", detalhes: err});
            }
            res.json({ mensagem: "Importação concluída com sucesso!", total: valores.length});  
        });
    });
});

router.get("/", (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 20;
    const offset = (pagina - 1) * limite;

    const sql = `SELECT * FROM schools LIMIT ? OFFSET ?`;

    connection.query(sql, [limite, offset], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao listar escolas", detalhes: err});
        }

        res.json({
            pagina,
            total: results.length,
            escolas: results
        });
    });
})

router.get("/:id", (req, res) => {
    const id = req.params.id;

    const sql = `SELECT * FROM schools WHERE id = ?`;

    connection.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao buscar escola pelo ID", detalhes: err});
        }

        if (results.length === 0) {
            return res.status(404).json({ mensagem: "Escola não encontrada"});
        }

        res.json(results[0]);
    })
})

router.post("/", (req, res) => {
    const { codesc, nomesc, mun, diretoria, tipoesc } = req.body;

    if (!codesc || !nomesc || !mun) {
        return res.status(400).json({ erro: "Campos obrigatórios: codesc, nomesc, mun"});
    }

    const sql = `
        INSERT INTO schools (codesc, nomesc, mun, diretoria, tipoesc)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(sql, [codesc, nomesc, mun, diretoria, tipoesc], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao criar escola", detalhes: err});
        }

        res.status(201).json({
            mensagem: "Escola criada com sucesso!",
            id: result.insertId
        });
    });
});

router.put("/:id", (req, res) => {
    const id = req.params.id;
    const { codesc, nomesc, mun, diretoria, tipoesc } = req.body;

    const sql = `
        UPDATE schools
        SET codesc = ?, nomesc = ?, mun = ?, diretoria = ?, tipoesc = ?
        WHERE id = ? 
    `;

    connection.query(sql, [codesc, nomesc, mun, diretoria, tipoesc, id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao atualizar escola", detalhes: err});
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Escola não encontrada" });
        }

        res.json({ mensagem: "Escola atualizada com sucesso!" });
    });
});

router.delete("/:id", (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM schools WHERE id = ?`;

    connection.query(sql, [id], (err, result) => {
        if (err) {
        return res.status(500).json({ erro: "Erro ao deletar escola", detalhes: err});
    }

    if (result.affectedRows === 0) {
        return res.status(404).json({ mensagem: "Escola não encontrada" });
    }

    res.json({ mensagem: "Escola deletada com sucesso!"}); 
    });
});

export default router;