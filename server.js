import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Certifique-se de que está instalado ou use o global do Node 18+

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Configurações do GitHub vindas das variáveis de ambiente do Render
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "azdevcoder/nathricco";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Aumentado para suportar PDFs

// --- FUNÇÃO AUXILIAR PARA SALVAR NO GITHUB ---
async function salvarNoGithub(path, conteudoBase64, mensagem) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    
    // 1. Tentar pegar o SHA do arquivo se ele já existir
    const getResp = await fetch(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    
    let sha;
    if (getResp.ok) {
        const getJson = await getResp.json();
        sha = getJson.sha;
    }

    // 2. Enviar o arquivo
    const putResp = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: mensagem,
            content: conteudoBase64,
            sha: sha, // Se existir, o GitHub atualiza; se não, cria novo
            branch: GITHUB_BRANCH
        })
    });

    return putResp;
}

// --- ROTA DA AGENDA (Salvar agendamentos.json) ---
app.post("/salvar-agenda", async (req, res) => {
    try {
        const eventos = req.body;
        const jsonString = JSON.stringify(eventos, null, 2);
        const base64 = Buffer.from(jsonString, 'utf-8').toString('base64');
        
        const response = await salvarNoGithub('dados/agendamentos.json', base64, "Sincronização de Agenda");

        if (response.ok) return res.json({ ok: true });
        const err = await response.json();
        res.status(500).json({ error: "Erro GitHub Agenda", details: err });
    } catch (err) {
        res.status(500).json({ error: "Erro interno Agenda" });
    }
});

// --- ROTA DE UPLOAD DE CONTRATO ---
app.post("/upload", async (req, res) => {
    try {
        const { nomeArquivo, conteudoBase64 } = req.body;
        // Salva dentro da pasta dados/ para manter organizado
        const path = `dados/${nomeArquivo}`; 
        
        const response = await salvarNoGithub(path, conteudoBase64, `Novo contrato: ${nomeArquivo}`);

        if (response.ok) return res.json({ ok: true });
        res.status(500).json({ error: "Erro GitHub Contrato" });
    } catch (err) {
        res.status(500).json({ error: "Erro interno Upload" });
    }
});

// --- ROTA DE LISTAGEM DE CONTRATOS ---
app.get('/contratos-assinados-nath', async (req, res) => {
    try {
        const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/dados`;
        const resp = await fetch(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        if (!resp.ok) return res.json([]);

        const data = await resp.json();
        const arquivos = data
            .filter(file => file.name.endsWith('.pdf'))
            .map(file => ({
                name: file.name.replace('.pdf', '').replace(/_/g, ' '),
                url: file.download_url
            }));

        res.json(arquivos);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
