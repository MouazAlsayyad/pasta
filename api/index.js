import express from 'express';
import { createClient } from 'redis';

const app = express();
const PLAYERS_KEY = 'players';

app.use(express.json());

let redisClient;

async function getClient() {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL is not configured');
    }
    redisClient = createClient({ url });
    redisClient.on('error', (err) => console.error('Redis client error:', err));
    await redisClient.connect();
  }
  return redisClient;
}

async function getPlayers() {
  const client = await getClient();
  const raw = await client.get(PLAYERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setPlayers(players) {
  const client = await getClient();
  await client.set(PLAYERS_KEY, JSON.stringify(players));
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
    await setPlayers(players);
    res.json(players);
  } catch (err) {
    console.error('POST /api/score failed:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

export default app;
