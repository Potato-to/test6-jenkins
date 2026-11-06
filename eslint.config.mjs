import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default ts.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'unpackage/**',
      'packages/**',
      'internal/**',
      '**/*.d.ts',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: ts.parser, extraFileExtensions: ['.vue'] } },
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, uni: 'readonly', plus: 'readonly' },
    },
    rules: { 'vue/html-self-closing': 'off', 'vue/max-attributes-per-line': 'off' },
  },
  prettier,
);
