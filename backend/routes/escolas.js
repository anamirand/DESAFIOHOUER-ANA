import { verificarToken } from "../middleware/authMiddleware.js";
import express from "express";
import { connection } from "../db.js";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const router = express.Router();
router.use(verificarToken);

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get("/", (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 100;
  const offset = (pagina - 1) * limite;

  const sql = `
    SELECT id, codesc, nomesc, mun, tipoesc_desc
    FROM schools
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `;

  connection.query(sql, [limite, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao listar escolas" });
    }

    connection.query("SELECT COUNT(*) AS total FROM schools", (countErr, countResult) => {
      if (countErr) return res.status(500).json({ erro: "Erro ao contar registros" });

      res.json({
        pagina,
        total: countResult[0].total,
        escolas: results,
      });
    });
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM schools WHERE id = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    if (results.length === 0) return res.status(404).json({ erro: "Escola não encontrada" });
    res.json(results[0]);
  });
});

router.post("/upload", upload.single("arquivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: "Nenhum arquivo enviado" });

  try {
    await new Promise((resolve, reject) => {
      connection.query("TRUNCATE TABLE schools", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  } catch {
    return res.status(500).json({ erro: "Erro ao limpar tabela antes da importação." });
  }

  const caminho = req.file.path;
  const results = [];

  const mapHeaders = {
    NOMEDEP: "nomedep",
    DE: "de",
    MUN: "mun",
    DISTR: "distr",
    NOMESC: "nomesc",
    TIPOESC_DESC: "tipoesc_desc",
    CODESC: "codesc",
    TIPOESC: "tipoesc",
    CODSIT: "codsit",
    SALAS_AULA: "salas_aula",
    SALAS_ED_INF: "salas_ed_inf",
    SALAS_ED_ESP: "salas_ed_esp",
    SALAS_ED_ART: "salas_ed_art",
    SALA_RECURSO: "sala_recurso",
    TOT_SALAS_AULA: "tot_salas_aula",
    AUDITORIO: "auditorio",
    ANFITEATRO: "anfiteatro",
    TEATRO: "teatro",
    CANTINA: "cantina",
    COPA: "copa",
    COZINHA: "cozinha",
    REFEITORIO: "refeitorio",
    DEPOSITO_ALIMENTOS: "deposito_alimentos",
    DESPENSA: "despensa",
    TOT_DESPENSA: "tot_despensa",
    SALA_LEITURA: "sala_leitura",
    BIBLIOTECA: "biblioteca",
    TOT_SALA_LEITURA: "tot_sala_leitura",
    QUADRA_COBERTA: "quadra_coberta",
    QUADRA_DESCOBERTA: "quadra_descoberta",
    GINASIO: "ginasio",
    TOT_QUADRA: "tot_quadra",
    CAMPO_FUTEBOL: "campo_futebol",
    DIRETORIA: "diretoria",
    VICEDIRETORIA: "vicediretoria",
    SALA_PROF: "sala_prof",
    SECRETARIA: "secretaria",
    SALA_COORD_PEDAG: "sala_coord_pedag",
  };

  fs.createReadStream(caminho)
    .pipe(
      csv({
        separator: ";",
        mapHeaders: ({ header }) => mapHeaders[header.trim().toUpperCase()] || null,
      })
    )
    .on("data", (row) => {
      const filteredRow = Object.fromEntries(Object.entries(row).filter(([k]) => k));
      results.push(filteredRow);
    })
    .on("end", async () => {
      if (results.length === 0) {
        return res.status(400).json({ erro: "CSV vazio ou formato incorreto." });
      }

      const colunas = Object.keys(results[0]);
      const sql = `INSERT INTO schools (${colunas.join(", ")}) VALUES ?`;
      const valores = results.map((linha) => colunas.map((coluna) => linha[coluna]));

      connection.query(sql, [valores], (err, result) => {
        if (err) return res.status(500).json({ erro: "Erro ao importar CSV" });
        res.json({ mensagem: "Importação concluída com sucesso.", total: result.affectedRows });
      });
    })
    .on("error", (err) => {
      res.status(500).json({ erro: "Erro ao ler o CSV", detalhes: err.message });
    });
});

router.post("/", (req, res) => {
  const novaEscola = req.body;
  const sql = "INSERT INTO schools (codesc, nomesc, mun, tipoesc_desc) VALUES (?, ?, ?, ?)";
  connection.query(
    sql,
    [novaEscola.codesc, novaEscola.nomesc, novaEscola.mun, novaEscola.tipoesc_desc],
    (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro ao criar escola" });
      res.json({ mensagem: "Escola criada com sucesso", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const campos = req.body;
  const chaves = Object.keys(campos);
  const valores = Object.values(campos);
  const sql = `UPDATE schools SET ${chaves.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`;

  connection.query(sql, [...valores, id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao atualizar escola" });
    if (result.affectedRows === 0) return res.status(404).json({ mensagem: "Escola não encontrada" });
    res.json({ mensagem: "Escola atualizada com sucesso." });
  });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM schools WHERE id = ?`;

  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao deletar escola" });
    if (result.affectedRows === 0) return res.status(404).json({ mensagem: "Escola não encontrada" });
    res.json({ mensagem: "Escola deletada com sucesso." });
  });
});

export default router;
