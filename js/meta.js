/**
 * Neon Ricochet: Rogue Synth
 * Meta-Progression & LocalStorage Persistence System
 */

class MetaManager {
  constructor() {
    this.STORAGE_KEY = 'neon_ricochet_save_v1';
    this.data = this.getDefaultData();
    this.load();
  }

  getDefaultData() {
    return {
      credits: 250,
      highScore: 0,
      maxWave: 1,
      totalRuns: 0,
      totalBallsFired: 0,
      totalNodesDestroyed: 0,
      equippedSkin: 'cyan',
      unlockedSkins: ['cyan'],
      hasVip: false,
      labLevels: {
        startBalls: 0,
        baseDamage: 0,
        critChance: 0,
        shields: 0,
        creditBonus: 0
      }
    };
  }

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = Object.assign(this.getDefaultData(), parsed);
      }
    } catch (e) {
      console.warn('Could not load save data, using defaults.', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save data.', e);
    }
  }

  addCredits(amount) {
    let multiplier = 1 + (this.data.labLevels.creditBonus || 0) * 0.15;
    if (this.data.hasVip) multiplier *= 2;
    const finalAmount = Math.round(amount * multiplier);
    this.data.credits += finalAmount;
    this.save();
    return finalAmount;
  }

  spendCredits(amount) {
    if (this.data.credits >= amount) {
      this.data.credits -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getLabCost(key) {
    const upgrade = CONFIG.LAB_UPGRADES[key];
    if (!upgrade) return 999999;
    const currentLvl = this.data.labLevels[key] || 0;
    if (currentLvl >= upgrade.maxLevel) return null;
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLvl));
  }

  upgradeLab(key) {
    const cost = this.getLabCost(key);
    const upgrade = CONFIG.LAB_UPGRADES[key];
    if (!cost || !upgrade) return false;

    const currentLvl = this.data.labLevels[key] || 0;
    if (currentLvl >= upgrade.maxLevel) return false;

    if (this.spendCredits(cost)) {
      this.data.labLevels[key] = currentLvl + 1;
      this.save();
      return true;
    }
    return false;
  }

  unlockSkin(skinId) {
    if (!this.data.unlockedSkins.includes(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
    }
  }

  setEquippedSkin(skinId) {
    if (this.data.unlockedSkins.includes(skinId) || this.data.hasVip) {
      this.data.equippedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  activateVip() {
    this.data.hasVip = true;
    CONFIG.BALL_SKINS.forEach(s => {
      if (!this.data.unlockedSkins.includes(s.id)) {
        this.data.unlockedSkins.push(s.id);
      }
    });
    this.save();
  }

  recordGameStats(score, wave, ballsFired, nodesDestroyed) {
    this.data.totalRuns += 1;
    this.data.totalBallsFired += ballsFired;
    this.data.totalNodesDestroyed += nodesDestroyed;
    if (score > this.data.highScore) {
      this.data.highScore = score;
    }
    if (wave > this.data.maxWave) {
      this.data.maxWave = wave;
    }
    this.save();
  }

  resetAll() {
    this.data = this.getDefaultData();
    this.save();
  }
}

if (typeof window !== 'undefined') {
  window.metaManager = new MetaManager();
}
