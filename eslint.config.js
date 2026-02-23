const common = require('@js-toolkit/configs/eslint/common');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...common,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
