/**
 * Neon Ricochet: Rogue Synth
 * Game Entities: Ball, Geometric Node, Particles, and VFX
 */

class Particle {
  constructor(x, y, color, size = 3, speed = 4) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * speed + 1;
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.03 + 0.02;
    this.alive = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.alpha -= this.decay;
    if (this.alpha <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color = '#00f0ff', isCrit = false) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.isCrit = isCrit;
    this.vy = -1.6;
    this.alpha = 1.0;
    this.alive = true;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.025;
    if (this.alpha <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.font = this.isCrit ? 'bold 16px "Courier New", monospace' : 'bold 12px "Courier New", monospace';
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.isCrit ? 10 : 4;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class Ball {
  constructor(x, y, vx, vy, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = options.radius || CONFIG.BALL_RADIUS;
    this.color = options.color || '#00f0ff';
    this.glow = options.glow || '#00f0ff';
    this.damage = options.damage || CONFIG.BASE_BALL_DAMAGE;
    this.bounces = 0;
    this.piercing = options.piercing || false;
    this.isClone = options.isClone || false;
    this.active = true;
    this.returned = false;
    this.history = [];
  }

  update(width, height, bottomY, engine) {
    if (!this.active || this.returned) return;

    // Track trail history
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 5) this.history.shift();

    // Step physics
    this.x += this.vx;
    this.y += this.vy;

    // Left & Right Wall Bounce
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
      this.onWallBounce(engine);
    } else if (this.x + this.radius >= width) {
      this.x = width - this.radius;
      this.vx = -Math.abs(this.vx);
      this.onWallBounce(engine);
    }

    // Top Wall Bounce
    if (this.y - this.radius <= CONFIG.TOP_OFFSET) {
      this.y = CONFIG.TOP_OFFSET + this.radius;
      this.vy = Math.abs(this.vy);
      this.onWallBounce(engine);
    }

    // Bottom reached
    if (this.y + this.radius >= bottomY) {
      this.y = bottomY;
      this.returned = true;
      this.active = false;
      engine.onBallReturned(this);
    }
  }

  onWallBounce(engine) {
    this.bounces++;
    if (engine.hasRelic('momentum_bounce')) {
      this.damage *= 1.04;
    }
    if (window.soundEngine) window.soundEngine.playWallBounce();
  }

  draw(ctx) {
    if (!this.active) return;

    // Draw neon trail
    if (this.history.length > 1) {
      ctx.save();
      for (let i = 0; i < this.history.length - 1; i++) {
        const pt = this.history[i];
        const alpha = (i + 1) / this.history.length * 0.4;
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = this.radius * (i / this.history.length);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw main glowing orb
    ctx.save();
    ctx.shadowColor = this.glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

class GameNode {
  constructor(col, row, x, y, size, typeKey, wave) {
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
    this.size = size;
    this.typeKey = typeKey;
    this.config = CONFIG.NODE_TYPES[typeKey] || CONFIG.NODE_TYPES.HEXAGON;

    // Calculate scaling HP
    const baseMult = this.config.baseHpMultiplier || 1.0;
    const hpCalc = Math.max(1, Math.round((wave * 8 + Math.pow(wave, 1.25) * 4) * baseMult));
    this.maxHp = this.config.isOrbPlus ? 1 : hpCalc;
    this.hp = this.maxHp;

    this.alive = true;
    this.hitPulse = 0;
    this.rotation = 0;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
  }

  takeDamage(amount, engine, isCrit = false) {
    if (!this.alive) return;
    this.hp -= amount;
    this.hitPulse = 1.0;

    // Floating combat text
    const displayDmg = Math.round(amount);
    engine.addFloatingText(this.x, this.y - 10, isCrit ? `CRIT! ${displayDmg}` : `${displayDmg}`, isCrit ? '#ffe600' : '#ffffff', isCrit);

    // Sparks
    for (let i = 0; i < (isCrit ? 8 : 4); i++) {
      engine.particles.push(new Particle(this.x, this.y, this.config.color, 3, 5));
    }

    if (window.soundEngine) {
      window.soundEngine.playBounceChime(isCrit);
    }

    if (this.hp <= 0) {
      this.destroy(engine);
    }
  }

  destroy(engine) {
    this.alive = false;
    engine.addScore(this.config.scoreValue);

    // Massive particle explosion
    for (let i = 0; i < 20; i++) {
      engine.particles.push(new Particle(this.x, this.y, this.config.color, 4, 8));
    }

    // Credits reward
    const creditsToDrop = (this.config.creditDrop || 1) + (engine.hasRelic('mint_credits') ? 2 : 0);
    const earned = window.metaManager.addCredits(creditsToDrop);
    engine.addFloatingText(this.x, this.y + 10, `+${earned}💎`, '#00ffcc');

    if (window.soundEngine) {
      window.soundEngine.playExplosion(this.config.isBoss);
    }

    // Special node effects
    if (this.config.isOrbPlus) {
      engine.permanentExtraBalls += 1;
      engine.addFloatingText(this.x, this.y - 20, '+1 BALL!', '#39ff14', true);
    }

    if (this.config.isBomb) {
      engine.triggerBombExplosion(this.x, this.y, this.config.radius);
    }

    if (this.config.isLaser) {
      engine.triggerLaserClear(this.col, this.row);
    }

    if (this.config.isBoss) {
      engine.addFloatingText(this.x, this.y - 40, 'BOSS DESTROYED!', '#ff0055', true);
      engine.addScore(5000);
    }
  }

  update() {
    this.rotation += this.rotSpeed;
    if (this.hitPulse > 0) {
      this.hitPulse -= 0.1;
      if (this.hitPulse < 0) this.hitPulse = 0;
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const scale = 1 + this.hitPulse * 0.15;
    ctx.scale(scale, scale);

    ctx.shadowColor = this.config.glow;
    ctx.shadowBlur = this.hitPulse > 0 ? 18 : 8;
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';

    const r = this.size;

    // Draw Shape based on Type
    ctx.beginPath();
    if (this.typeKey === 'HEXAGON' || this.typeKey === 'BOSS_CORE') {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (this.typeKey === 'DIAMOND') {
      ctx.moveTo(0, -r * 1.15);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r * 1.15);
      ctx.lineTo(-r, 0);
      ctx.closePath();
    } else if (this.typeKey === 'TRIANGLE') {
      ctx.moveTo(0, -r * 1.2);
      ctx.lineTo(r * 1.1, r * 0.9);
      ctx.lineTo(-r * 1.1, r * 0.9);
      ctx.closePath();
    } else if (this.config.isOrbPlus) {
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    } else if (this.config.isBomb || this.config.isLaser) {
      // Octagon
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      ctx.rect(-r, -r, r * 2, r * 2);
    }

    ctx.fill();
    ctx.stroke();

    // Draw Node Icon / HP Text
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.config.isOrbPlus) {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#39ff14';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+🔮', 0, 0);
    } else if (this.config.isBomb) {
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#ff3b30';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', 0, -6);
      ctx.font = 'bold 11px monospace';
      ctx.fillText(this.hp, 0, 10);
    } else if (this.config.isLaser) {
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#b026ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, -6);
      ctx.font = 'bold 11px monospace';
      ctx.fillText(this.hp, 0, 10);
    } else {
      ctx.font = this.config.isBoss ? 'bold 18px "Courier New", monospace' : 'bold 13px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.config.glow;
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.hp, 0, 0);
    }

    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.Particle = Particle;
  window.FloatingText = FloatingText;
  window.Ball = Ball;
  window.GameNode = GameNode;
}
