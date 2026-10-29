import { browser } from 'wxt/browser';
import { AUTO_SKIP_KEY, getAutoSkipEnabled } from '../utils/settings';

// Class on the Skip Ads button. 
const SKIP_BUTTON_SELECTOR = '.ytp-skip-ad-button';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],

  async main() {
    let autoSkipEnabled = await getAutoSkipEnabled();
    let player: HTMLElement | null = null;
    let playerObserver: MutationObserver | null = null;
    let adShowing = false;
    let skipButtonReady = false;

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

    // The button must be on screen, not hidden by CSS.
    function isVisible(element: HTMLElement): boolean {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    }

    // The button must not be disabled.
    function isDisabled(element: HTMLElement): boolean {
      return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
    }

    function findReadySkipButton(): HTMLElement | null {
      const buttons = Array.from(document.querySelectorAll<HTMLElement>(SKIP_BUTTON_SELECTOR));
      return buttons.find((button) => isVisible(button) && !isDisabled(button)) ?? null;
    }

    // Only look for the button during an ad. Log only when its ready state changes.
    function checkSkipButton() {
      const ready = adShowing && findReadySkipButton() !== null;
      if (ready === skipButtonReady) return;

      skipButtonReady = ready;
      console.log(`[YouTube Ad Skip] Skip button ${ready ? 'is ready' : 'is gone'}`);
    }

    function onPlayerChange() {
      checkAdState();
      checkSkipButton();
    }

    // Find the player and watch it. This runs again whenever YouTube replaces the player element.
    function attachToPlayer() {
      const current = document.querySelector<HTMLElement>('#movie_player');
      if (current === player) return;

      playerObserver?.disconnect();
      player = current;
      adShowing = false;
      if (!player) return;

      playerObserver = new MutationObserver(onPlayerChange);
      playerObserver.observe(player, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true,
      });

      console.log('[YouTube Ad Skip] Attached to player');
      onPlayerChange();
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

    setInterval(checkSkipButton, 250);
    attachToPlayer();
  },
});