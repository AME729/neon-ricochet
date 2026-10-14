/**
 * Neon Ricochet: Rogue Synth
 * Core 60 FPS Canvas Game Engine & Physics Loop
 */

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'AIMING'; // AIMING, FIRING, RESOLVING, RELIC_SELECT, GAME_OVER

    this.width = CONFIG.CANVAS_WIDTH;
    this.height = CONFIG.CANVAS_HEIGHT;

    this.launcherX = this.width / 2;
    this.launcherY = CONFIG.BOTTOM_LINE_Y;
    this.nextLauncherX = this.launcherX;

    this.aimAngle = -Math.PI / 2;
    this.isAiming = false;

    this.wave = 1;
    this.score = 0;
    this.shields = CONFIG.BASE_SHIELDS;
    this.permanentExtraBalls = 0;
    this.bonusBallsForRound = 0;

    this.balls = [];
    this.nodes = [];
    this.particles = [];
    this.floatingTexts = [];
    this.activeRelics = [];

    this.ballsToFire = 0;
    this.ballsFiredCount = 0;
    this.fireTimer = null;
    this.firstBallReturned = false;

    this.screenShake = 0;
    this.stats = {
      ballsFiredSession: 0,
      nodesDestroyedSession: 0
    };

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  startNewGame() {
    this.wave = 1;
    this.score = 0;
    this.permanentExtraBalls = 0;
    this.bonusBallsForRound = 0;
    this.activeRelics = [];
    this.nodes = [];
    this.balls = [];
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = 0;

    // Apply Meta Upgrades
    const meta = window.metaManager ? window.metaManager.data : {};
    const lab = meta.labLevels || {};
    this.shields = CONFIG.BASE_SHIELDS + (lab.shields || 0);

    this.launcherX = this.width / 2;
    this.launcherY = CONFIG.BOTTOM_LINE_Y;
    this.nextLauncherX = this.launcherX;

    this.stats.ballsFiredSession = 0;
    this.stats.nodesDestroyedSession = 0;

    // Spawn first rows
    this.spawnNewRow(1);
    this.spawnNewRow(2);

    this.state = 'AIMING';
    if (window.soundEngine) window.soundEngine.startBGM();
    this.updateHUD();
  }

  getTotalBalls() {
    const meta = window.metaManager ? window.metaManager.data : {};
    const lab = meta.labLevels || {};
    const metaBonus = (lab.startBalls || 0) * 2;
    return CONFIG.BASE_BALLS + metaBonus + this.permanentExtraBalls + this.bonusBallsForRound;
  }

  getBaseDamage() {
    const meta = window.metaManager ? window.metaManager.data : {};
    const lab = meta.labLevels || {};
    let dmg = CONFIG.BASE_BALL_DAMAGE * (1 + (lab.baseDamage || 0) * 0.15);
    if (this.hasRelic('overcharge')) dmg *= 1.35;
    return dmg;
  }

  getCritChance() {
    const meta = window.metaManager ? window.metaManager.data : {};
    const lab = meta.labLevels || {};
    return (lab.critChance || 0) * 0.03;
  }

  hasRelic(id) {
    return this.activeRelics.some(r => r.id === id);
  }

  addRelic(relic) {
    this.activeRelics.push(relic);
    if (relic.id === 'volleyball') {
      this.permanentExtraBalls += 5;
    }
    if (window.soundEngine) window.soundEngine.playFanfare();
    this.state = 'AIMING';
    this.updateHUD();
  }

  spawnNewRow(targetRow = 1) {
    const cols = CONFIG.GRID_COLS;
    const cellWidth = this.width / cols;
    const nodeSize = cellWidth * 0.38;

    const isBossWave = this.wave % 10 === 0;

    if (isBossWave && targetRow === 1) {
      // Spawn Boss in Center
      const bossX = this.width / 2;
      const bossY = CONFIG.TOP_OFFSET + targetRow * 58;
      this.nodes.push(new GameNode(3, targetRow, bossX, bossY, nodeSize * 2.2, 'BOSS_CORE', this.wave));
      return;
    }

    for (let c = 0; c < cols; c++) {
      // Random density (60% chance of a node)
      if (Math.random() < 0.62) {
        const x = c * cellWidth + cellWidth / 2;
        const y = CONFIG.TOP_OFFSET + targetRow * 58;

        // Choose Type
        const roll = Math.random();
        let type = 'HEXAGON';
        if (roll < 0.12) type = 'ORB_PLUS';
        else if (roll < 0.22) type = 'BOMB';
        else if (roll < 0.32) type = 'LASER_NODE';
        else if (roll < 0.52) type = 'DIAMOND';
        else if (roll < 0.72) type = 'TRIANGLE';

        this.nodes.push(new GameNode(c, targetRow, x, y, nodeSize, type, this.wave));
      }
    }
  }

  advanceWave() {
    this.wave++;
    this.bonusBallsForRound = 0; // Reset temporary bonus

    // Move existing nodes down
    const rowStep = 58;
    let breached = false;

    for (const node of this.nodes) {
      if (node.alive) {
        node.row += 1;
        node.y += rowStep;

        if (node.y + node.size >= CONFIG.BOTTOM_LINE_Y) {
          breached = true;
        }
      }
    }

    if (breached) {
      if (this.shields > 0) {
        this.shields--;
        this.triggerScreenShake(18);
        this.addFloatingText(this.width / 2, CONFIG.BOTTOM_LINE_Y - 40, '⚡ EMP BARRIER TRIGGERED! (-1 SHIELD)', '#00f0ff', true);

        // Destroy bottom nodes
        for (const node of this.nodes) {
          if (node.alive && node.y + node.size >= CONFIG.BOTTOM_LINE_Y - 20) {
            node.destroy(this);
          }
        }
      } else {
        this.triggerGameOver();
        return;
      }
    }

    // Spawn new row at top
    this.spawnNewRow(1);

    // Offer Relic Draft every 3 waves
    if (this.wave % 3 === 0) {
      this.triggerRelicSelect();
    } else {
      this.state = 'AIMING';
    }

    this.updateHUD();
  }

  triggerRelicSelect() {
    this.state = 'RELIC_SELECT';
    if (window.soundEngine) window.soundEngine.playFanfare();

    // Pick 3 random relics not already owned
    const pool = CONFIG.RELICS.filter(r => !this.hasRelic(r.id) || r.id === 'volleyball');
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);

    const modal = document.getElementById('relic-modal');
    const container = document.getElementById('relic-cards-container');
    if (!modal || !container) {
      this.state = 'AIMING';
      return;
    }

    container.innerHTML = '';
    choices.forEach(relic => {
      const card = document.createElement('div');
      card.className = `relic-card ${relic.rarity}`;
      card.innerHTML = `
        <div class="relic-icon">${relic.icon}</div>
        <div class="relic-name">${relic.name}</div>
        <div class="relic-rarity">${relic.rarity.toUpperCase()}</div>
        <div class="relic-desc">${relic.desc}</div>
      `;
      card.onclick = () => {
        this.addRelic(relic);
        modal.classList.add('hidden');
      };
      container.appendChild(card);
    });

    modal.classList.remove('hidden');
  }

  fireVolley() {
    if (this.state !== 'AIMING') return;

    this.state = 'FIRING';
    this.ballsToFire = this.getTotalBalls();
    this.ballsFiredCount = 0;
    this.firstBallReturned = false;
    this.nextLauncherX = this.launcherX;

    const baseDmg = this.getBaseDamage();
    const equipped = window.metaManager ? window.metaManager.data.equippedSkin : 'cyan';
    const skin = CONFIG.BALL_SKINS.find(s => s.id === equipped) || CONFIG.BALL_SKINS[0];

    if (window.soundEngine) window.soundEngine.playLaunch();

    const speed = CONFIG.BALL_SPEED;
    const vx = Math.cos(this.aimAngle) * speed;
    const vy = Math.sin(this.aimAngle) * speed;

    this.fireTimer = setInterval(() => {
      if (this.ballsFiredCount < this.ballsToFire) {
        this.balls.push(new Ball(this.launcherX, this.launcherY - 10, vx, vy, {
          damage: baseDmg,
          color: skin.color,
          glow: skin.glow,
          piercing: this.hasRelic('piercing_beam') && Math.random() < 0.20
        }));
        this.ballsFiredCount++;
        this.stats.ballsFiredSession++;
      } else {
        clearInterval(this.fireTimer);
        this.fireTimer = null;
      }
    }, 45);
  }

  onBallReturned(ball) {
    if (!this.firstBallReturned) {
      this.firstBallReturned = true;
      this.nextLauncherX = Math.max(20, Math.min(this.width - 20, ball.x));
    }

    // Check if all balls are back
    const allReturned = this.balls.every(b => b.returned || !b.active);
    if (allReturned && this.ballsFiredCount >= this.ballsToFire) {
      this.balls = [];
      this.launcherX = this.nextLauncherX;
      this.advanceWave();
    }
  }

  handleBallNodeCollisions(ball) {
    const critChance = this.getCritChance();

    for (const node of this.nodes) {
      if (!node.alive) continue;

      const dx = ball.x - node.x;
      const dy = ball.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = ball.radius + node.size;

      if (dist < minDist) {
        // Calculate collision normal
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // Reflect velocity if not piercing
        if (!ball.piercing) {
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx = ball.vx - 2 * dot * nx;
          ball.vy = ball.vy - 2 * dot * ny;

          // Push out of penetration
          ball.x = node.x + nx * (minDist + 1);
          ball.y = node.y + ny * (minDist + 1);
        }

        // Apply Damage
        const isCrit = Math.random() < critChance;
        const finalDmg = isCrit ? ball.damage * 2.5 : ball.damage;
        node.takeDamage(finalDmg, this, isCrit);
        this.stats.nodesDestroyedSession++;

        // Relic: Splitter Matrix (clone a mini ball on impact)
        if (this.hasRelic('splitter') && Math.random() < 0.22 && !ball.isClone && this.balls.length < 120) {
          const splitAngle = Math.atan2(ball.vy, ball.vx) + (Math.random() - 0.5);
          const spd = CONFIG.BALL_SPEED * 1.1;
          this.balls.push(new Ball(ball.x, ball.y, Math.cos(splitAngle) * spd, Math.sin(splitAngle) * spd, {
            damage: ball.damage * 0.6,
            color: '#39ff14',
            glow: '#39ff14',
            isClone: true
          }));
        }

        // Relic: Arc Discharge
        if (this.hasRelic('chain_lightning')) {
          this.triggerChainLightning(node, ball.damage * 0.5);
        }

        // Relic: Plasma Nova shockwave
        if (this.hasRelic('plasma_nova')) {
          ball.bounces++;
          if (ball.bounces % 8 === 0) {
            this.triggerBombExplosion(node.x, node.y, 90, ball.damage * 0.8);
          }
        }

        break; // One collision per ball step
      }
    }
  }

  triggerChainLightning(sourceNode, damage) {
    let targets = 0;
    for (const node of this.nodes) {
      if (node.alive && node !== sourceNode) {
        const d = Math.hypot(node.x - sourceNode.x, node.y - sourceNode.y);
        if (d < 140) {
          node.takeDamage(damage, this, false);
          // Visual spark line
          for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(node.x, node.y, '#ffe600', 3, 4));
          }
          targets++;
          if (targets >= 2) break;
        }
      }
    }
    if (targets > 0 && window.soundEngine) window.soundEngine.playLaser();
  }

  triggerBombExplosion(x, y, radius, customDamage) {
    this.triggerScreenShake(12);
    for (let i = 0; i < 30; i++) {
      this.particles.push(new Particle(x, y, '#ff3b30', 4, 9));
    }
    for (const node of this.nodes) {
      if (node.alive) {
        const d = Math.hypot(node.x - x, node.y - y);
        if (d <= radius) {
          node.takeDamage(customDamage || (this.getBaseDamage() * 3.5), this, true);
        }
      }
    }
  }

  triggerLaserClear(col, row) {
    this.triggerScreenShake(14);
    if (window.soundEngine) window.soundEngine.playLaser();

    // Damage all in same col and row
    for (const node of this.nodes) {
      if (node.alive && (node.col === col || node.row === row)) {
        node.takeDamage(this.getBaseDamage() * 4, this, true);
      }
    }
  }

  triggerScreenShake(intensity = 10) {
    this.screenShake = intensity;
  }

  addScore(pts) {
    this.score += pts;
    this.updateHUD();
  }

  addFloatingText(x, y, text, color, isCrit) {
    this.floatingTexts.push(new FloatingText(x, y, text, color, isCrit));
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    if (window.soundEngine) {
      window.soundEngine.stopBGM();
      window.soundEngine.playGameOver();
    }

    if (window.metaManager) {
      window.metaManager.recordGameStats(this.score, this.wave, this.stats.ballsFiredSession, this.stats.nodesDestroyedSession);
    }

    const modal = document.getElementById('game-over-modal');
    const finalScore = document.getElementById('final-score');
    const finalWave = document.getElementById('final-wave');
    if (modal && finalScore && finalWave) {
      finalScore.textContent = this.score.toLocaleString();
      finalWave.textContent = `WAVE ${this.wave}`;
      modal.classList.remove('hidden');
    }
  }

  revivePlayer() {
    this.shields = 2;
    this.state = 'AIMING';
    // Clear bottom danger rows
    for (const node of this.nodes) {
      if (node.alive && node.y >= CONFIG.BOTTOM_LINE_Y - 140) {
        node.destroy(this);
      }
    }
    const modal = document.getElementById('game-over-modal');
    if (modal) modal.classList.add('hidden');
    if (window.soundEngine) window.soundEngine.startBGM();
    this.updateHUD();
  }

  updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    const waveEl = document.getElementById('hud-wave');
    const ballsEl = document.getElementById('hud-balls');
    const shieldsEl = document.getElementById('hud-shields');
    const creditsEl = document.getElementById('hud-credits');

    if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
    if (waveEl) waveEl.textContent = `WAVE ${this.wave}`;
    if (ballsEl) ballsEl.textContent = `🔮 ${this.getTotalBalls()}`;
    if (shieldsEl) shieldsEl.textContent = `🛡️ ${this.shields}`;
    if (creditsEl && window.metaManager) creditsEl.textContent = `💎 ${window.metaManager.data.credits}`;
  }

  // Draw aim laser trajectory with reflection
  drawAimTrajectory(ctx) {
    if (this.state !== 'AIMING') return;

    ctx.save();
    let curX = this.launcherX;
    let curY = this.launcherY;
    let angle = this.aimAngle;
    let lengthRemaining = 650;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(curX, curY);

    for (let bounce = 0; bounce < 2; bounce++) {
      let vx = Math.cos(angle);
      let vy = Math.sin(angle);
      let targetX = curX + vx * lengthRemaining;
      let targetY = curY + vy * lengthRemaining;

      // Check wall intersection
      if (targetX < 0) {
        const distToWall = (0 - curX) / vx;
        curX = 0;
        curY += vy * distToWall;
        ctx.lineTo(curX, curY);
        angle = Math.PI - angle;
        lengthRemaining -= distToWall;
      } else if (targetX > this.width) {
        const distToWall = (this.width - curX) / vx;
        curX = this.width;
        curY += vy * distToWall;
        ctx.lineTo(curX, curY);
        angle = Math.PI - angle;
        lengthRemaining -= distToWall;
      } else if (targetY < CONFIG.TOP_OFFSET) {
        const distToWall = (CONFIG.TOP_OFFSET - curY) / vy;
        curX += vx * distToWall;
        curY = CONFIG.TOP_OFFSET;
        ctx.lineTo(curX, curY);
        break;
      } else {
        ctx.lineTo(targetX, targetY);
        break;
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  update() {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }

    // Update Nodes
    for (const node of this.nodes) {
      node.update();
    }

    // Update Balls & check collisions
    for (const ball of this.balls) {
      ball.update(this.width, this.height, CONFIG.BOTTOM_LINE_Y, this);
      this.handleBallNodeCollisions(ball);
    }

    // Clean dead nodes
    this.nodes = this.nodes.filter(n => n.alive);

    // Update Particles
    for (const p of this.particles) p.update();
    this.particles = this.particles.filter(p => p.alive);

    // Update Floating Texts
    for (const ft of this.floatingTexts) ft.update();
    this.floatingTexts = this.floatingTexts.filter(ft => ft.alive);
  }

  draw() {
    this.ctx.save();

    // Screen shake offset
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(sx, sy);
    }

    // Clear background
    this.ctx.fillStyle = '#060814';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Synthwave Grid Horizon in background
    this.drawBackgroundGrid(this.ctx);

    // Draw Top Header Bar & Bottom Baseline
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, CONFIG.TOP_OFFSET);
    this.ctx.lineTo(this.width, CONFIG.TOP_OFFSET);
    this.ctx.stroke();

    // Defeat Line at bottom
    this.ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
    this.ctx.shadowColor = '#ff0055';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(0, CONFIG.BOTTOM_LINE_Y);
    this.ctx.lineTo(this.width, CONFIG.BOTTOM_LINE_Y);
    this.ctx.stroke();

    // Draw Aim Trajectory
    this.drawAimTrajectory(this.ctx);

    // Draw Nodes
    for (const node of this.nodes) {
      node.draw(this.ctx);
    }

    // Draw Particles
    for (const p of this.particles) {
      p.draw(this.ctx);
    }

    // Draw Balls
    for (const ball of this.balls) {
      ball.draw(this.ctx);
    }

    // Draw Launcher Node
    this.drawLauncher(this.ctx);

    // Draw Floating Text
    for (const ft of this.floatingTexts) {
      ft.draw(this.ctx);
    }

    this.ctx.restore();
  }

  drawLauncher(ctx) {
    ctx.save();
    ctx.translate(this.launcherX, this.launcherY);

    // Launcher base
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Pointer nozzle
    if (this.state === 'AIMING') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(this.aimAngle) * 22, Math.sin(this.aimAngle) * 22);
      ctx.stroke();
    }

    // Ball count tag
    if (this.state === 'AIMING') {
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`x${this.getTotalBalls()}`, 0, 24);
    }

    ctx.restore();
  }

  drawBackgroundGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(176, 38, 255, 0.08)';
    ctx.lineWidth = 1;

    // Perspective vertical grid lines
    const vCols = 10;
    const step = this.width / vCols;
    for (let i = 0; i <= vCols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, CONFIG.TOP_OFFSET);
      ctx.lineTo(i * step, CONFIG.BOTTOM_LINE_Y);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = CONFIG.TOP_OFFSET; y <= CONFIG.BOTTOM_LINE_Y; y += 58) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}
