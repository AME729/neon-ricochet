/**
 * Neon Ricochet: Rogue Synth
 * Game Configuration & Roguelite Balance Data
 */

const CONFIG = {
  CANVAS_WIDTH: 540,
  CANVAS_HEIGHT: 840,
  GRID_COLS: 7,
  GRID_ROWS: 9,
  TOP_OFFSET: 110,
  BOTTOM_LINE_Y: 750,
  BALL_RADIUS: 7,
  BALL_SPEED: 14,
  MAX_BALL_SPEED: 22,

  BASE_BALLS: 15,
  BASE_BALL_DAMAGE: 10,
  BASE_SHIELDS: 3,

  // Node Types
  NODE_TYPES: {
    HEXAGON: {
      name: 'Hexagon Core',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.6)',
      baseHpMultiplier: 1.0,
      scoreValue: 100
    },
    DIAMOND: {
      name: 'Crystal Node',
      color: '#ff007f',
      glow: 'rgba(255, 0, 127, 0.6)',
      baseHpMultiplier: 0.7,
      scoreValue: 180,
      creditDrop: 2
    },
    TRIANGLE: {
      name: 'Deflector Prism',
      color: '#ffe600',
      glow: 'rgba(255, 230, 0, 0.6)',
      baseHpMultiplier: 0.8,
      scoreValue: 120
    },
    BOMB: {
      name: 'Plasma Mine',
      color: '#ff3b30',
      glow: 'rgba(255, 59, 48, 0.7)',
      baseHpMultiplier: 0.5,
      scoreValue: 200,
      isBomb: true,
      radius: 120
    },
    ORB_PLUS: {
      name: 'Ball Extender',
      color: '#39ff14',
      glow: 'rgba(57, 255, 20, 0.8)',
      baseHpMultiplier: 0.3,
      scoreValue: 150,
      isOrbPlus: true
    },
    LASER_NODE: {
      name: 'Cross Laser',
      color: '#b026ff',
      glow: 'rgba(176, 38, 255, 0.8)',
      baseHpMultiplier: 0.6,
      scoreValue: 250,
      isLaser: true
    },
    BOSS_CORE: {
      name: 'TITAN SYNTHESIS',
      color: '#ff0055',
      glow: 'rgba(255, 0, 85, 0.9)',
      baseHpMultiplier: 5.0,
      scoreValue: 2500,
      isBoss: true
    }
  },

  // Roguelite Draft Relics (offered on level up)
  RELICS: [
    {
      id: 'splitter',
      name: 'Splitter Matrix',
      icon: '💠',
      desc: '25% chance for orbs to clone on impact, creating a cascade volley.',
      rarity: 'rare'
    },
    {
      id: 'chain_lightning',
      name: 'Arc Discharge',
      icon: '⚡',
      desc: 'Orb hits jump electric arcs to 2 adjacent nodes for 50% damage.',
      rarity: 'epic'
    },
    {
      id: 'overcharge',
      name: 'Overcharged Orbs',
      icon: '💥',
      desc: '+35% base orb damage and leaves a searing ion trail.',
      rarity: 'common'
    },
    {
      id: 'plasma_nova',
      name: 'Plasma Nova',
      icon: '🌟',
      desc: 'Every 8th bounce emits an explosive shockwave hitting all nearby nodes.',
      rarity: 'rare'
    },
    {
      id: 'piercing_beam',
      name: 'Quantum Piercer',
      icon: '🔱',
      desc: 'Orbs have a 20% chance to slice through nodes without bouncing back.',
      rarity: 'epic'
    },
    {
      id: 'momentum_bounce',
      name: 'Kinetic Stacker',
      icon: '📈',
      desc: 'Orbs gain +4% damage for every bounce in the arena before returning.',
      rarity: 'common'
    },
    {
      id: 'magnetic_pull',
      name: 'Vortex Magnet',
      icon: '🧲',
      desc: 'Orbs subtly steer towards dense clusters of geometric nodes.',
      rarity: 'rare'
    },
    {
      id: 'volleyball',
      name: 'Multi-Ball Booster',
      icon: '🔮',
      desc: 'Immediately adds +5 permanent orbs to your volley for the rest of the run.',
      rarity: 'common'
    },
    {
      id: 'cryo_freeze',
      name: 'Cryo Grid Lock',
      icon: '❄️',
      desc: 'Slows down node descent speed and periodically freezes lowest row for 1 turn.',
      rarity: 'rare'
    },
    {
      id: 'mint_credits',
      name: 'Crypto Siphon',
      icon: '💎',
      desc: 'Destroyed nodes drop double Synth Credits for permanent lab upgrades.',
      rarity: 'common'
    }
  ],

  // Meta-Progression Lab Upgrades (Permanent, bought with Synth Credits)
  LAB_UPGRADES: {
    startBalls: {
      name: 'Starting Battery',
      desc: '+2 starting orbs per level',
      baseCost: 100,
      costMultiplier: 1.5,
      maxLevel: 10,
      icon: '🔮'
    },
    baseDamage: {
      name: 'Plasma Core Amplification',
      desc: '+15% orb damage per level',
      baseCost: 150,
      costMultiplier: 1.6,
      maxLevel: 10,
      icon: '⚡'
    },
    critChance: {
      name: 'Precision Tuning',
      desc: '+3% critical strike chance (2.5x damage)',
      baseCost: 200,
      costMultiplier: 1.7,
      maxLevel: 8,
      icon: '🎯'
    },
    shields: {
      name: 'EMP Defeat Barrier',
      desc: '+1 shield layer (absorbs nodes breaching baseline)',
      baseCost: 350,
      costMultiplier: 2.0,
      maxLevel: 5,
      icon: '🛡️'
    },
    creditBonus: {
      name: 'Neural Miner',
      desc: '+15% bonus credits earned per run',
      baseCost: 120,
      costMultiplier: 1.5,
      maxLevel: 10,
      icon: '💎'
    }
  },

  // Ball Skins & Palettes
  BALL_SKINS: [
    { id: 'cyan', name: 'Cyber Neon', color: '#00f0ff', glow: '#00f0ff', price: 0, unlocked: true },
    { id: 'magenta', name: 'Synthwave Pink', color: '#ff007f', glow: '#ff007f', price: 500, unlocked: false },
    { id: 'gold', name: 'Solar Flare', color: '#ffd700', glow: '#ffaa00', price: 1000, unlocked: false },
    { id: 'emerald', name: 'Matrix Acid', color: '#39ff14', glow: '#00ff66', price: 1500, unlocked: false },
    { id: 'violet', name: 'Quantum Void', color: '#b026ff', glow: '#7000ff', price: 2500, unlocked: false }
  ],

  // In-App Purchases (IAP) Simulation
  IAP_PACKS: [
    { id: 'credits_pack_small', name: 'Micro Credit Cache', amount: 1200, price: '$1.99', popular: false },
    { id: 'credits_pack_medium', name: 'Overclock Battery Pack', amount: 3500, price: '$4.99', popular: true },
    { id: 'credits_pack_large', name: 'Titan Matrix Core', amount: 10000, price: '$9.99', popular: false },
    { id: 'vip_pass', name: 'VIP Synthwave License', amount: 'ALL SKINS + 2X CREDITS FOREVER', price: '$14.99', isVip: true }
  ]
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
