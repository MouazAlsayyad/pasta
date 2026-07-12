import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { kv } from '@vercel/kv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, '..')));

app.get('/log', (_req, res) => {
  res.sendFile(join(__dirname, '..', 'log.html'));
});

app.get('/api/players', async (_req, res) => {
  const players = await kv.get('players') || [];
  res.json(players);
});

app.get('/api/top10', async (_req, res) => {
  const players = await kv.get('players') || [];
  res.json(players.slice(0, 10));
});

app.post('/api/score', async (req, res) => {
  const { name, score, date } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'score must be a number' });
  }
  const players = await kv.get('players') || [];
  players.push({
    name: name || 'Player',
    score,
    date: date || new Date().toISOString(),
  });
  players.sort((a, b) => b.score - a.score);
  await kv.set('players', players);
  res.json(players);
});

export default app;
