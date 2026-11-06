import { defineConfig, presetWind3 } from 'unocss';

// Only application pages use UnoCSS. Vben's vendored components retain their upstream compiler.
export default defineConfig({
  content: {
    filesystem: ['src/**/*.{vue,ts,tsx}'],
    pipeline: {
      include: [/\/src\/.*\.(vue|[jt]sx?)(\?.*)?$/],
      exclude: [/node_modules/, /[/\\]packages[/\\]/, /[/\\]internal[/\\]/],
    },
  },
  presets: [presetWind3({ preflight: false })],
  theme: { colors: { primary: 'hsl(var(--primary))' } },
  shortcuts: { 'page-card': 'm-6 rounded-xl bg-white p-6 shadow-sm' },
});
