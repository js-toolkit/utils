module.exports = {
  root: true,
  extends: require.resolve('@vzh/configs/eslint/common'),
  rules: {
    'import/export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
