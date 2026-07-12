import express from 'express';
import { kv } from '@vercel/kv';

const app = express();

app.use(express.json());

async function getPlayers() {
  return (await kv.get('players')) || [];
}

app.get('/api/players', async (_req, res) => {
  try {
    res.json(await getPlayers());
  } catch (err) {
    console.error('GET /api/players failed:', err);
    res.status(500).json({ error: 'Failed to load players' });
  }
});

app.get('/api/top10', async (_req, res) => {
  try {
    const players = await getPlayers();
    res.json(players.slice(0, 10));
  } catch (err) {
    console.error('GET /api/top10 failed:', err);
    res.status(500).json({ error: 'Failed to load top 10' });
  }
});

app.post('/api/score', async (req, res) => {
  const { name, score, date } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'score must be a number' });
  }

  try {
    const players = await getPlayers();
    players.push({
      name: name || 'Player',
      score,
      date: date || new Date().toISOString(),
    });
    players.sort((a, b) => b.score - a.score);
    await kv.set('players', players);
    res.json(players);
  } catch (err) {
    console.error('POST /api/score failed:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

export default app;
