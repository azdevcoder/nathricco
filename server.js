const express = require('express');
const cors = require('cors');

const app = express();

// Permite que o seu GitHub Pages faça requisições para esta API
app.use(cors());

// Aumenta o limite de tamanho do JSON para receber o PDF em Base64
app.use(express.json({ limit: '50mb' }));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'azdevcoder';
const REPO_NAME = 'nathricco';

app.post('/upload', async (req, res) => {
  try {
    const { nomeArquivo, conteudoBase64 } = req.body;

    if (!nomeArquivo || !conteudoBase64) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${nomeArquivo}`;
    
    // Faz a requisição para a API do GitHub
    const githubResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Adicionando contrato assinado: ${nomeArquivo}`,
        content: conteudoBase64
      })
    });

    const data = await githubResponse.json();

    if (githubResponse.ok) {
      res.status(200).json({ message: 'Contrato salvo com sucesso no GitHub!' });
    } else {
      console.error("Erro do GitHub:", data);
      res.status(githubResponse.status).json({ error: 'Erro ao salvar no GitHub', details: data });
    }

  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
