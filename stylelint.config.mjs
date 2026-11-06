export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
  ignoreFiles: ['node_modules/**', 'dist/**', 'unpackage/**', 'packages/**', 'internal/**'],
  rules: {
    'selector-type-no-unknown': null,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global'] }],
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'screen',
          'layer',
          'config',
          'source',
          'theme',
          'plugin',
          'custom-variant',
        ],
      },
    ],
    'at-rule-no-unknown': null,
    'import-notation': null,
    'no-empty-source': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'scss/operator-no-unspaced': null,
  },
};
