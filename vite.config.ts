import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
import UnoCSS from 'unocss/vite';
import { fileURLToPath, URL } from 'node:url';
// import { createDevProxy } from './config/dev-proxy.ts';

export default defineConfig({
  // Optional development proxy: uncomment the import and use
  // defineConfig(({ command, mode }) => ({ ... })) with the server option below.
  // server: { proxy: command === 'serve' ? createDevProxy(mode) : undefined },
  plugins: [vue(), vueJsx(), tailwindcss(), UnoCSS()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    conditions: ['source', 'development', 'module', 'browser'],
  },
});
