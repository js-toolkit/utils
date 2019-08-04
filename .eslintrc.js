module.exports = {
  root: true,
  extends: require.resolve('@vzh/configs/eslint/ts.common.eslintrc.js'),
  rules: {
    'import/export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
