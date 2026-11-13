import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const isUserOrOrgPages = repoName.endsWith('.github.io');
const pagesBase = isUserOrOrgPages ? '/' : `/${repoName}/`;

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? pagesBase : '/',
  plugins: [react()],
  resolve: {
    alias: {
      'blake3-wasm/browser.js': path.resolve(__dirname, 'src/latex/blake3-shim.js'),
    },
  },
  server: {
    port: 5173,
  },
});
