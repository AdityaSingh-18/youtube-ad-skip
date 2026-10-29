import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'YouTube Ad Skip',
    description: 'Automatically clicks the YouTube Skip Ads button when it becomes available.',
    permissions: ['storage'],
  },
});