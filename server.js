import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const DATA_FILE = join(DATA_DIR, 'players.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, '[]', 'utf-8');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get('/log', (_req, res) => {
  res.sendFile(join(__dirname, 'log.html'));
});

function readPlayers() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writePlayers(players) {
  writeFileSync(DATA_FILE, JSON.stringify(players, null, 2), 'utf-8');
}

app.get('/api/players', (_req, res) => {
  const players = readPlayers();
  res.json(players);
});

app.get('/api/top10', (_req, res) => {
  const players = readPlayers();
  res.json(players.slice(0, 10));
});

app.post('/api/score', (req, res) => {
  const { name, score, date } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'score must be a number' });
  }
  const players = readPlayers();
  players.push({
    name: name || 'Player',
    score,
    date: date || new Date().toISOString(),
  });
  players.sort((a, b) => b.score - a.score);
  writePlayers(players);
  res.json(players);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
