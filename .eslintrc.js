module.exports = {
  extends: require.resolve('@vzh/configs/eslint/ts.common.eslintrc.js'),
  rules: {
    'import/export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
