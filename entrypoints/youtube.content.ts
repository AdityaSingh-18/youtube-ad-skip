import { browser } from 'wxt/browser';
import { AUTO_SKIP_KEY, getAutoSkipEnabled } from '../utils/settings';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],

  async main() {
    let autoSkipEnabled = await getAutoSkipEnabled();
    let player: HTMLElement | null = null;
    let playerObserver: MutationObserver | null = null;
    let adShowing = false;

    console.log(`[YouTube Ad Skip] Auto Skip is ${autoSkipEnabled ? 'on' : 'off'}`);

    // Update the local copy when the popup changes the setting.
    browser.storage.onChanged.addListener(async (changes, areaName) => {
      if (areaName !== 'local' || !(AUTO_SKIP_KEY in changes)) return;

      autoSkipEnabled = await getAutoSkipEnabled();
      console.log(`[YouTube Ad Skip] Auto Skip is ${autoSkipEnabled ? 'on' : 'off'}`);
    });

    // Log only when the ad state changes, because the observer fires often.
    function checkAdState() {
      if (!player) return;

      const isShowing = player.classList.contains('ad-showing');
      if (isShowing === adShowing) return;

      adShowing = isShowing;
      console.log(`[YouTube Ad Skip] Ad ${isShowing ? 'started' : 'ended'}`);
    }

    // Find the player and watch it. This runs again whenever YouTube replaces the player element.
    function attachToPlayer() {
      const current = document.querySelector<HTMLElement>('#movie_player');
      if (current === player) return;

      playerObserver?.disconnect();
      player = current;
      adShowing = false;
      if (!player) return;

      playerObserver = new MutationObserver(checkAdState);
      playerObserver.observe(player, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true,
      });

      console.log('[YouTube Ad Skip] Attached to player');
      checkAdState();
    }

    // YouTube changes pages without a reload, so re-check the player when navigation finishes.
    document.addEventListener('yt-navigate-finish', () => {
      console.log('[YouTube Ad Skip] Navigated to a new page');
      attachToPlayer();
    });

    // The player may not exist yet when this script starts, so watch the page for it.
    new MutationObserver(attachToPlayer).observe(document.body, {
      childList: true,
      subtree: true,
    });

    attachToPlayer();
  },
});