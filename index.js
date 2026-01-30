import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://azdevcoder.github.io";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "nathricco/dados";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

if (!GITHUB_TOKEN) {
  console.error("Falta a variável de ambiente GITHUB_TOKEN.");
  process.exit(1);
}

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "30mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

// --- ROTA PARA CONTRATOS (EXISTENTE) ---
app.post("/upload", async (req, res) => {
    // ... seu código de upload de PDF permanece igual ...
});

// --- NOVA ROTA: SALVAR AGENDAMENTOS JSON ---
app.post("/salvar-agenda", async (req, res) => {
  try {
    const eventos = req.body; // Recebe o array de agendamentos do Frontend
    const path = `dados/agendamentos.json`;
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`;

    // 1) Buscar o arquivo atual para obter o SHA (necessário para update)
    const getResp = await fetch(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    let sha;
    if (getResp.ok) {
      const getJson = await getResp.json();
      sha = getJson.sha;
    }

    // 2) Preparar o conteúdo (Converter JSON -> String -> Base64)
    const jsonString = JSON.stringify(eventos, null, 2);
    const conteudoBase64 = Buffer.from(jsonString, 'utf-8').toString('base64');

    // 3) Enviar para o GitHub
    const body = {
      message: "Sincronização automática de agendamentos",
      content: conteudoBase64,
      branch: GITHUB_BRANCH
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (putResp.ok) {
      return res.json({ ok: true, message: "Agenda sincronizada no GitHub" });
    } else {
      const errorJson = await putResp.json();
      return res.status(500).json({ error: "Erro ao salvar no GitHub", details: errorJson });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor AzDev rodando na porta ${PORT}`);
});
