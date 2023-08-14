module.exports = {
  root: true,
  extends: require.resolve('@js-toolkit/configs/eslint/common'),
  rules: {
    'import/export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
