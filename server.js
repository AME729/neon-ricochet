const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to leaderboard storage
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Helper to read leaderboard
function getLeaderboard() {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
  }
  return [
    { name: 'SynthMaster', score: 128400, wave: 28, ballsFired: 1420, build: 'Splitter Quantum', date: '2026-10-11' },
    { name: 'VaporPulse', score: 96250, wave: 22, ballsFired: 1080, build: 'Chain Lightning', date: '2026-10-12' },
    { name: 'GridRunner', score: 81500, wave: 19, ballsFired: 940, build: 'Plasma Nova', date: '2026-10-12' },
    { name: 'NeonPeglin', score: 64900, wave: 15, ballsFired: 720, build: 'Laser Piercer', date: '2026-10-13' },
    { name: 'CyberBounce', score: 45300, wave: 12, ballsFired: 510, build: 'Giga Bouncer', date: '2026-10-14' }
  ];
}

// Helper to save leaderboard
function saveLeaderboard(data) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving leaderboard file:', err);
  }
}

// GET /api/leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = getLeaderboard();
  res.json({ success: true, leaderboard: leaderboard.slice(0, 25) });
});

// POST /api/leaderboard
app.post('/api/leaderboard', (req, res) => {
  const { name, score, wave, ballsFired, build } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const leaderboard = getLeaderboard();
  const entry = {
    name: String(name).slice(0, 16).replace(/[^\w\s-]/g, '') || 'SynthPlayer',
    score: Math.max(0, Math.floor(score)),
    wave: Math.max(1, Math.floor(wave || 1)),
    ballsFired: Math.max(0, Math.floor(ballsFired || 0)),
    build: build || 'Standard Orbs',
    date: new Date().toISOString().split('T')[0]
  };

  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  const trimmed = leaderboard.slice(0, 50);
  saveLeaderboard(trimmed);

  res.json({ success: true, entry, rank: trimmed.findIndex(e => e === entry) + 1 });
});

// GET /api/status - Flippa buyer verification endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    game: 'Neon Ricochet: Rogue Synth',
    version: '1.0.0',
    category: 'Physics Breaker Roguelite',
    theme: 'Retro Synthwave Geometric',
    monetization: {
      rewardedAdsActive: true,
      shopActive: true,
      eCPMTarget: '$6.50 - $12.00',
      readyForFlippa: true
    }
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`✨ Neon Ricochet: Rogue Synth is online!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🕹️ Ready for gameplay testing & Flippa verification.`);
  console.log(`=================================================`);
});
