export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    console.log('[YouTube Ad Skip] content script loaded');
  },
});