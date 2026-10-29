import { browser } from 'wxt/browser';

// The key Auto Skip is saved under in chrome.storage.local.
export const AUTO_SKIP_KEY = 'autoSkipEnabled';

// Start enabled, since skipping is the extension's main purpose.
const DEFAULT_AUTO_SKIP = true;

export async function getAutoSkipEnabled(): Promise<boolean> {
  const result = await browser.storage.local.get(AUTO_SKIP_KEY);
  const saved = result[AUTO_SKIP_KEY];

  // Use the saved value only if it's a boolean. On first run nothing is saved, so the default applies.
  return typeof saved === 'boolean' ? saved : DEFAULT_AUTO_SKIP;
}

export async function setAutoSkipEnabled(enabled: boolean): Promise<void> {
  await browser.storage.local.set({ [AUTO_SKIP_KEY]: enabled });
}