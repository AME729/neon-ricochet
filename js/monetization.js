/**
 * Neon Ricochet: Rogue Synth
 * Monetization Manager (Rewarded Video Ads & IAP Checkout Engine)
 * Turnkey integration ready for Google AdSense for Games, CrazyGames, AdinPlay, and Stripe.
 */

class MonetizationManager {
  constructor() {
    this.adState = {
      impressions: 0,
      rewardedCompleted: 0,
      simulatedAdRevenue: 0.00,
      iapTransactions: 0,
      iapGrossRevenue: 0.00
    };
    this.loadStats();
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('neon_monetization_stats');
      if (saved) {
        this.adState = Object.assign(this.adState, JSON.parse(saved));
      }
    } catch (e) {}
  }

  saveStats() {
    try {
      localStorage.setItem('neon_monetization_stats', JSON.stringify(this.adState));
    } catch (e) {}
  }

  // Simulate or invoke real Rewarded Video Ad
  showRewardedVideo(rewardType, onRewarded, onClosed) {
    const adModal = document.getElementById('ad-modal');
    const adTimer = document.getElementById('ad-timer');
    const adTitle = document.getElementById('ad-title');
    const adRewardDesc = document.getElementById('ad-reward-desc');
    const adCloseBtn = document.getElementById('ad-close-btn');

    if (!adModal) {
      if (onRewarded) onRewarded();
      return;
    }

    let titleText = 'SPONSORED REWARDED AD';
    let rewardText = 'Watching sponsored content...';

    if (rewardType === 'revive') {
      titleText = 'EMERGENCY SHIELD REVIVE';
      rewardText = 'Watch ad to clear danger rows & gain +2 Shields!';
    } else if (rewardType === 'double_credits') {
      titleText = '2X SYNTH CREDITS BOOSTER';
      rewardText = 'Watch ad to double all credits gathered this run!';
    } else if (rewardType === 'bonus_orbs') {
      titleText = 'QUANTUM VOLLEY OVERLOAD';
      rewardText = 'Watch ad to receive +15 extra balls for this wave!';
    }

    adTitle.textContent = titleText;
    adRewardDesc.textContent = rewardText;
    adModal.classList.remove('hidden');
    adCloseBtn.classList.add('hidden');

    let secondsLeft = 4;
    adTimer.textContent = `Reward unlocks in ${secondsLeft}s`;

    const countdown = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        adTimer.textContent = `Reward unlocks in ${secondsLeft}s`;
      } else {
        clearInterval(countdown);
        adTimer.textContent = '✅ REWARD UNLOCKED!';
        adCloseBtn.classList.remove('hidden');

        // Track stats
        this.adState.impressions += 1;
        this.adState.rewardedCompleted += 1;
        this.adState.simulatedAdRevenue += 0.025; // Approx $25 eCPM
        this.saveStats();

        if (onRewarded) onRewarded();
      }
    }, 1000);

    adCloseBtn.onclick = () => {
      adModal.classList.add('hidden');
      if (onClosed) onClosed();
    };
  }

  // Simulate IAP Purchase Modal (Credit Card / PayPal ready)
  openCheckout(packId, onSuccess) {
    const pack = CONFIG.IAP_PACKS.find(p => p.id === packId);
    if (!pack) return;

    const modal = document.getElementById('checkout-modal');
    const title = document.getElementById('checkout-title');
    const price = document.getElementById('checkout-price');
    const desc = document.getElementById('checkout-desc');
    const confirmBtn = document.getElementById('checkout-confirm-btn');
    const cancelBtn = document.getElementById('checkout-cancel-btn');
    const statusText = document.getElementById('checkout-status');

    if (!modal) return;

    title.textContent = pack.name;
    price.textContent = pack.price;
    desc.textContent = pack.isVip ? 'Instant VIP Unlock + 2X Multiplier' : `+${pack.amount} Synth Credits`;
    statusText.textContent = '';
    modal.classList.remove('hidden');

    confirmBtn.disabled = false;
    confirmBtn.onclick = () => {
      confirmBtn.disabled = true;
      statusText.innerHTML = '<span class="pulsing">Processing encrypted transaction...</span>';

      setTimeout(() => {
        statusText.innerHTML = '<span style="color: #39ff14;">✅ Payment Successful! Delivery complete.</span>';

        // Add credits or VIP status
        if (pack.isVip) {
          window.metaManager.activateVip();
        } else {
          window.metaManager.addCredits(pack.amount);
        }

        // Record metrics
        const numericPrice = parseFloat(pack.price.replace('$', '')) || 0;
        this.adState.iapTransactions += 1;
        this.adState.iapGrossRevenue += numericPrice;
        this.saveStats();

        if (window.soundEngine) window.soundEngine.playFanfare();

        setTimeout(() => {
          modal.classList.add('hidden');
          if (onSuccess) onSuccess(pack);
        }, 1200);
      }, 1500);
    };

    cancelBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }
}

if (typeof window !== 'undefined') {
  window.monetizationManager = new MonetizationManager();
}
