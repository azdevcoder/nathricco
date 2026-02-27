const express = require('express');
const cors = require('cors');

const app = express();

// Permite requisições do seu GitHub Pages
app.use(cors());

// Limite alto para receber PDFs grandes
app.use(express.json({ limit: '50mb' }));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'azdevcoder';
const REPO_NAME = 'nathricco';

// ==========================================
// ROTA 1: SALVAR CONTRATO (A que você já tem)
// ==========================================
app.post('/upload', async (req, res) => {
  try {
    const { nomeArquivo, conteudoBase64 } = req.body;

    if (!nomeArquivo || !conteudoBase64) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${nomeArquivo}`;
    
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
      res.status(githubResponse.status).json({ error: 'Erro ao salvar no GitHub', details: data });
    }

  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// ROTA 2: LISTAR CONTRATOS (A NOVA ROTA!)
// ==========================================
app.get('/contratos-assinados-nath', async (req, res) => {
  try {
    // Aponta para a pasta onde salvamos os PDFs
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/contratos-assinados-nath`;

    const githubResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    // Se a pasta não existir ainda (ex: nenhum contrato foi salvo), retornamos array vazio
    if (githubResponse.status === 404) {
      return res.status(200).json([]);
    }

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      return res.status(githubResponse.status).json({ error: 'Erro ao buscar no GitHub', details: errorData });
    }

    const data = await githubResponse.json();

    // Filtra apenas os arquivos PDF (evita listar pastas ou arquivos soltos)
    const arquivosMapeados = data
      .filter(file => file.type === 'file' && file.name.endsWith('.pdf'))
      .map(file => {
        // Limpa o nome do arquivo para ficar mais bonito na tela (tira o hash numérico e a extensão)
        // Exemplo: "12345_Contrato_Nathalli_Ricco_Maria_Silva.pdf" vira "Maria Silva"
        let nomeAmigavel = file.name
            .replace(/^[0-9]+_Contrato_Nathalli_Ricco_/, '') // Tira o prefixo
            .replace('.pdf', '') // Tira a extensão
            .replace(/_/g, ' '); // Troca underline por espaço

        return {
          name: nomeAmigavel,
          url: file.download_url, // Link direto para abrir o PDF
          date: "Contrato Assinado" // O GitHub não retorna a data de criação facilmente nessa rota, então usamos um texto padrão
        };
      });

    res.status(200).json(arquivosMapeados);

  } catch (error) {
    console.error("Erro interno ao listar:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
