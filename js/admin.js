/**
 * Neon Ricochet: Rogue Synth
 * Flippa Owner Admin Dashboard & Turnkey Buyer Analytics Console
 */

class AdminManager {
  constructor() {
    this.godMode = false;
  }

  init() {
    const adminBtn = document.getElementById('flippa-admin-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeBtn = document.getElementById('admin-close-btn');

    if (adminBtn && adminModal) {
      adminBtn.onclick = () => {
        this.renderStats();
        adminModal.classList.remove('hidden');
      };
    }

    if (closeBtn && adminModal) {
      closeBtn.onclick = () => {
        adminModal.classList.add('hidden');
      };
    }

    this.bindActionButtons();
  }

  renderStats() {
    const meta = window.metaManager ? window.metaManager.data : {};
    const mon = window.monetizationManager ? window.monetizationManager.adState : {};

    const elSessions = document.getElementById('adm-sessions');
    const elAdImpressions = document.getElementById('adm-ad-impressions');
    const elAdRevenue = document.getElementById('adm-ad-rev');
    const elIapRevenue = document.getElementById('adm-iap-rev');
    const elTotalRev = document.getElementById('adm-total-rev');
    const elEcpm = document.getElementById('adm-ecpm');

    const adRev = mon.simulatedAdRevenue || 0;
    const iapRev = mon.iapGrossRevenue || 0;
    const totalRev = adRev + iapRev;

    if (elSessions) elSessions.textContent = meta.totalRuns || 0;
    if (elAdImpressions) elAdImpressions.textContent = mon.impressions || 0;
    if (elAdRevenue) elAdRevenue.textContent = `$${adRev.toFixed(2)}`;
    if (elIapRevenue) elIapRevenue.textContent = `$${iapRev.toFixed(2)}`;
    if (elTotalRev) elTotalRev.textContent = `$${totalRev.toFixed(2)}`;
    if (elEcpm) elEcpm.textContent = `$12.50 - $25.00`;
  }

  bindActionButtons() {
    // Add Credits
    const btnAddCredits = document.getElementById('adm-add-credits');
    if (btnAddCredits) {
      btnAddCredits.onclick = () => {
        if (window.metaManager) {
          window.metaManager.data.credits += 5000;
          window.metaManager.save();
          if (window.gameEngine) window.gameEngine.updateHUD();
          alert('✅ Added +5,000 Synth Credits to your balance!');
          this.renderStats();
        }
      };
    }

    // Add +25 Orbs
    const btnAddOrbs = document.getElementById('adm-add-orbs');
    if (btnAddOrbs) {
      btnAddOrbs.onclick = () => {
        if (window.gameEngine) {
          window.gameEngine.permanentExtraBalls += 25;
          window.gameEngine.updateHUD();
          alert('✅ Added +25 Permanent Orbs for this run!');
        }
      };
    }

    // Toggle God Mode (Infinite Shields)
    const btnGodMode = document.getElementById('adm-god-mode');
    if (btnGodMode) {
      btnGodMode.onclick = () => {
        this.godMode = !this.godMode;
        if (window.gameEngine) {
          if (this.godMode) {
            window.gameEngine.shields = 999;
          } else {
            window.gameEngine.shields = 3;
          }
          window.gameEngine.updateHUD();
        }
        btnGodMode.textContent = `🛡️ God Mode: ${this.godMode ? 'ON' : 'OFF'}`;
      };
    }

    // Spawn Boss Wave
    const btnSpawnBoss = document.getElementById('adm-spawn-boss');
    if (btnSpawnBoss) {
      btnSpawnBoss.onclick = () => {
        if (window.gameEngine) {
          window.gameEngine.wave = 9;
          window.gameEngine.advanceWave();
          const adminModal = document.getElementById('admin-modal');
          if (adminModal) adminModal.classList.add('hidden');
        }
      };
    }

    // Trigger Screen Nuke
    const btnNuke = document.getElementById('adm-nuke');
    if (btnNuke) {
      btnNuke.onclick = () => {
        if (window.gameEngine) {
          window.gameEngine.nodes.forEach(n => n.destroy(window.gameEngine));
          const adminModal = document.getElementById('admin-modal');
          if (adminModal) adminModal.classList.add('hidden');
        }
      };
    }

    // Test Rewarded Ad
    const btnTestAd = document.getElementById('adm-test-ad');
    if (btnTestAd) {
      btnTestAd.onclick = () => {
        if (window.monetizationManager) {
          window.monetizationManager.showRewardedVideo('double_credits', () => {
            alert('🎉 Test Rewarded Ad completed successfully!');
            this.renderStats();
          });
        }
      };
    }

    // Reset Save Data
    const btnReset = document.getElementById('adm-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm('Reset all save data and stats to factory defaults?')) {
          if (window.metaManager) window.metaManager.resetAll();
          if (window.monetizationManager) {
            window.monetizationManager.adState = {
              impressions: 0,
              rewardedCompleted: 0,
              simulatedAdRevenue: 0.00,
              iapTransactions: 0,
              iapGrossRevenue: 0.00
            };
            window.monetizationManager.saveStats();
          }
          if (window.gameEngine) window.gameEngine.updateHUD();
          this.renderStats();
          alert('🔄 Factory reset complete.');
        }
      };
    }
  }
}

if (typeof window !== 'undefined') {
  window.adminManager = new AdminManager();
}
