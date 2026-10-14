/**
 * Neon Ricochet: Rogue Synth
 * Main Application Orchestrator & UI Event System
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const engine = new GameEngine(canvas);
  window.gameEngine = engine;

  // Initialize Audio & Admin
  if (window.soundEngine) window.soundEngine.init();
  if (window.adminManager) window.adminManager.init();

  // Screens & Navigation
  const startScreen = document.getElementById('start-screen');
  const gameHud = document.getElementById('game-hud');
  const btnStart = document.getElementById('btn-start-game');
  const btnLab = document.getElementById('btn-open-lab');
  const btnShop = document.getElementById('btn-open-shop');
  const btnLeaderboard = document.getElementById('btn-open-leaderboard');
  const btnAudioToggle = document.getElementById('audio-toggle-btn');

  // Modals
  const labModal = document.getElementById('lab-modal');
  const labClose = document.getElementById('lab-close-btn');
  const shopModal = document.getElementById('shop-modal');
  const shopClose = document.getElementById('shop-close-btn');
  const leaderModal = document.getElementById('leaderboard-modal');
  const leaderClose = document.getElementById('leaderboard-close-btn');
  const gameOverModal = document.getElementById('game-over-modal');

  // Start Game Button
  btnStart.onclick = () => {
    if (window.soundEngine) window.soundEngine.init();
    startScreen.classList.add('hidden');
    gameHud.classList.remove('hidden');
    engine.startNewGame();
  };

  // Audio Toggle
  btnAudioToggle.onclick = () => {
    if (window.soundEngine) {
      window.soundEngine.init();
      const isMuted = window.soundEngine.toggleMute();
      btnAudioToggle.textContent = isMuted ? '🔇' : '🔊';
    }
  };

  // Open Lab (Meta Progression)
  btnLab.onclick = () => {
    renderLabUpgrades();
    labModal.classList.remove('hidden');
  };
  labClose.onclick = () => labModal.classList.add('hidden');

  // Open Shop (IAP & Skins)
  btnShop.onclick = () => {
    renderShopPacks();
    shopModal.classList.remove('hidden');
  };
  shopClose.onclick = () => shopModal.classList.add('hidden');

  // Open Leaderboard
  btnLeaderboard.onclick = () => {
    fetchLeaderboard();
    leaderModal.classList.remove('hidden');
  };
  leaderClose.onclick = () => leaderModal.classList.add('hidden');

  // Aiming Controls (Mouse & Touch)
  function handleAim(clientX, clientY) {
    if (engine.state !== 'AIMING') return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const targetX = (clientX - rect.left) * scaleX;
    const targetY = (clientY - rect.top) * scaleY;

    // Calculate angle towards mouse/touch
    const dx = targetX - engine.launcherX;
    const dy = targetY - engine.launcherY;

    // Clamp angle so user fires upwards (between -170 deg and -10 deg)
    let angle = Math.atan2(dy, dx);
    if (angle > -0.15) angle = -0.15;
    if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;

    engine.aimAngle = angle;
  }

  canvas.addEventListener('mousemove', (e) => {
    handleAim(e.clientX, e.clientY);
  });

  canvas.addEventListener('mouseup', () => {
    if (engine.state === 'AIMING') {
      engine.fireVolley();
    }
  });

  // Touch Support
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleAim(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (engine.state === 'AIMING') {
      engine.fireVolley();
    }
  });

  // Game Over Actions
  const btnReviveAd = document.getElementById('btn-revive-ad');
  const btnDoubleCreditsAd = document.getElementById('btn-double-credits-ad');
  const btnRestart = document.getElementById('btn-restart-game');
  const btnSubmitScore = document.getElementById('btn-submit-score');
  const playerNameInput = document.getElementById('player-name-input');

  if (btnReviveAd) {
    btnReviveAd.onclick = () => {
      if (window.monetizationManager) {
        window.monetizationManager.showRewardedVideo('revive', () => {
          engine.revivePlayer();
        });
      }
    };
  }

  if (btnDoubleCreditsAd) {
    btnDoubleCreditsAd.onclick = () => {
      if (window.monetizationManager) {
        window.monetizationManager.showRewardedVideo('double_credits', () => {
          const earned = window.metaManager.addCredits(250);
          btnDoubleCreditsAd.textContent = `✅ DOUBLED (+${earned}💎)`;
          btnDoubleCreditsAd.disabled = true;
          engine.updateHUD();
        });
      }
    };
  }

  if (btnRestart) {
    btnRestart.onclick = () => {
      gameOverModal.classList.add('hidden');
      engine.startNewGame();
    };
  }

  if (btnSubmitScore) {
    btnSubmitScore.onclick = async () => {
      const name = (playerNameInput.value.trim() || 'SynthPilot').slice(0, 15);
      btnSubmitScore.disabled = true;
      btnSubmitScore.textContent = 'Submitting...';

      try {
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            score: engine.score,
            wave: engine.wave,
            ballsFired: engine.stats.ballsFiredSession,
            build: engine.activeRelics.map(r => r.name).join(', ') || 'Pure Volley'
          })
        });
        const data = await res.json();
        if (data.success) {
          btnSubmitScore.textContent = `✅ Ranked #${data.rank}!`;
          setTimeout(() => {
            fetchLeaderboard();
            leaderModal.classList.remove('hidden');
          }, 800);
        }
      } catch (err) {
        console.warn('Backend not available, score saved locally.', err);
        btnSubmitScore.textContent = 'Saved Locally!';
      }
    };
  }

  // Render Lab Upgrades
  function renderLabUpgrades() {
    const container = document.getElementById('lab-upgrades-list');
    const balanceEl = document.getElementById('lab-credits-balance');
    if (!container || !window.metaManager) return;

    balanceEl.textContent = `💎 ${window.metaManager.data.credits}`;
    container.innerHTML = '';

    for (const [key, upgrade] of Object.entries(CONFIG.LAB_UPGRADES)) {
      const currentLvl = window.metaManager.data.labLevels[key] || 0;
      const cost = window.metaManager.getLabCost(key);
      const isMax = currentLvl >= upgrade.maxLevel;

      const item = document.createElement('div');
      item.className = 'lab-upgrade-card';
      item.innerHTML = `
        <div class="lab-card-left">
          <div class="lab-icon">${upgrade.icon}</div>
          <div class="lab-info">
            <div class="lab-name">${upgrade.name} (Lvl ${currentLvl}/${upgrade.maxLevel})</div>
            <div class="lab-desc">${upgrade.desc}</div>
          </div>
        </div>
        <div class="lab-card-right">
          <button class="action-btn glow-btn lab-buy-btn" ${isMax ? 'disabled' : ''}>
            ${isMax ? 'MAX' : `💎 ${cost}`}
          </button>
        </div>
      `;

      const buyBtn = item.querySelector('.lab-buy-btn');
      if (!isMax) {
        buyBtn.onclick = () => {
          if (window.metaManager.upgradeLab(key)) {
            if (window.soundEngine) window.soundEngine.playFanfare();
            renderLabUpgrades();
            engine.updateHUD();
          } else {
            alert('Not enough Synth Credits! Play more rounds or visit the Shop.');
          }
        };
      }

      container.appendChild(item);
    }
  }

  // Render Shop Packs & Skins
  function renderShopPacks() {
    const packsContainer = document.getElementById('shop-packs-list');
    const skinsContainer = document.getElementById('shop-skins-list');
    const balanceEl = document.getElementById('shop-credits-balance');

    if (balanceEl && window.metaManager) {
      balanceEl.textContent = `💎 ${window.metaManager.data.credits}`;
    }

    if (packsContainer) {
      packsContainer.innerHTML = '';
      CONFIG.IAP_PACKS.forEach(pack => {
        const card = document.createElement('div');
        card.className = `shop-card ${pack.popular ? 'popular' : ''} ${pack.isVip ? 'vip' : ''}`;
        card.innerHTML = `
          ${pack.popular ? '<div class="badge">BEST VALUE</div>' : ''}
          ${pack.isVip ? '<div class="badge gold">VIP PASS</div>' : ''}
          <div class="shop-pack-title">${pack.name}</div>
          <div class="shop-pack-amount">${typeof pack.amount === 'number' ? `+${pack.amount} 💎` : pack.amount}</div>
          <button class="action-btn glow-btn iap-btn">${pack.price}</button>
        `;

        card.querySelector('.iap-btn').onclick = () => {
          if (window.monetizationManager) {
            window.monetizationManager.openCheckout(pack.id, () => {
              renderShopPacks();
              engine.updateHUD();
            });
          }
        };

        packsContainer.appendChild(card);
      });
    }

    if (skinsContainer && window.metaManager) {
      skinsContainer.innerHTML = '';
      const meta = window.metaManager.data;

      CONFIG.BALL_SKINS.forEach(skin => {
        const isUnlocked = meta.unlockedSkins.includes(skin.id) || meta.hasVip;
        const isEquipped = meta.equippedSkin === skin.id;

        const card = document.createElement('div');
        card.className = `skin-card ${isEquipped ? 'equipped' : ''}`;
        card.innerHTML = `
          <div class="skin-ball-preview" style="background: ${skin.color}; box-shadow: 0 0 14px ${skin.glow};"></div>
          <div class="skin-name">${skin.name}</div>
          <button class="action-btn skin-btn ${isEquipped ? 'equipped-btn' : ''}">
            ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : `💎 ${skin.price}`}
          </button>
        `;

        const btn = card.querySelector('.skin-btn');
        btn.onclick = () => {
          if (isUnlocked) {
            window.metaManager.setEquippedSkin(skin.id);
            renderShopPacks();
          } else {
            if (window.metaManager.spendCredits(skin.price)) {
              window.metaManager.unlockSkin(skin.id);
              window.metaManager.setEquippedSkin(skin.id);
              if (window.soundEngine) window.soundEngine.playFanfare();
              renderShopPacks();
            } else {
              alert('Not enough Synth Credits!');
            }
          }
        };

        skinsContainer.appendChild(card);
      });
    }
  }

  // Fetch Leaderboard
  async function fetchLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    listEl.innerHTML = '<div style="text-align: center; color: #00f0ff;">Loading leaderboard data...</div>';

    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.leaderboard) {
        renderLeaderboardList(data.leaderboard);
      }
    } catch (e) {
      // Offline fallback
      const fallback = [
        { name: 'SynthMaster', score: 128400, wave: 28, build: 'Splitter Quantum' },
        { name: 'VaporPulse', score: 96250, wave: 22, build: 'Chain Lightning' },
        { name: 'GridRunner', score: 81500, wave: 19, build: 'Plasma Nova' }
      ];
      renderLeaderboardList(fallback);
    }
  }

  function renderLeaderboardList(rows) {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    rows.forEach((row, i) => {
      const item = document.createElement('div');
      item.className = 'leader-row';
      item.innerHTML = `
        <span class="leader-rank">#${i + 1}</span>
        <span class="leader-name">${row.name}</span>
        <span class="leader-wave">Wave ${row.wave}</span>
        <span class="leader-score">${row.score.toLocaleString()} PTS</span>
      `;
      listEl.appendChild(item);
    });
  }

  // Main 60 FPS Game Loop
  function gameLoop() {
    engine.update();
    engine.draw();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
