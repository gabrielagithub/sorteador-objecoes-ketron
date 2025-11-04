const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, 'objeções.txt');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '', 'utf8');

function carregarObjecoes() {
  const dados = fs.readFileSync(FILE, 'utf8');
  return dados.split('\n').map(s => s.trim()).filter(s => s.length > 0);
}

function salvarObjeçao(texto) {
  fs.appendFileSync(FILE, texto.replace(/\r?\n/g, ' ') + '\n', 'utf8');
}

app.get('/api/objecoes', (req, res) => {
  try {
    const lista = carregarObjecoes();
    res.json({ success: true, data: lista });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/objecoes', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Texto vazio' });
    salvarObjeçao(text.trim());
    res.json({ success: true, message: 'Objeção salva' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sortear', (req, res) => {
  try {
    const lista = carregarObjecoes();
    if (lista.length === 0) return res.status(200).json({ success: true, data: null, message: 'Nenhuma objeção cadastrada' });
    const sorteada = lista[Math.floor(Math.random() * lista.length)];
    res.json({ success: true, data: sorteada });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// optional clear endpoint - protected by a simple query token (not secure for production)
app.post('/api/limpar', (req, res) => {
  const token = req.query.token || '';
  // token default 'ketron-clear' - change in production
  if (token !== 'ketron-clear') return res.status(403).json({ success: false, error: 'Forbidden' });
  try {
    fs.writeFileSync(FILE, '', 'utf8');
    res.json({ success: true, message: 'Arquivo limpo' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sorteador de objeções rodando em http://localhost:${PORT}`);
});
