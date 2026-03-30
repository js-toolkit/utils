const common = require('@js-toolkit/configs/eslint/common');
const { getFilesGlob, getTSExtensions } = require('@js-toolkit/configs/extensions');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...common,

  {
    files: [getFilesGlob(getTSExtensions())],

    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.config.ts', 'src/DataEventEmitter.ts'],
        },
      },
    },

    rules: {},
  },

  {
    files: [getFilesGlob(getTSExtensions(), 'src/types')],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
];
