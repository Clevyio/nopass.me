module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: { ecmaVersion: 7 },
  rules: {
    'no-console': 0,
    'no-empty': 0,
    'object-curly-newline': 0,
    'consistent-return': 0,
    'no-unused-vars': [1, { argsIgnorePattern: '^_', varsIgnorePattern: '(^debug$|^_)' }],
    'eol-last': 0,
    'arrow-parens': 0,
    camelcase: 0,
    'max-len': 0,
    'no-underscore-dangle': 0,
    'padded-blocks': ['error', { classes: 'always' }],
    'arrow-body-style': 0,
    'no-useless-escape': 0,
    'prefer-destructuring': [1, { array: false, object: true }],
    'no-multi-spaces': 0,
    'no-param-reassign': [2, { props: false }],
    'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'import/prefer-default-export': 0,
    'new-cap': 0,
    'no-multiple-empty-lines': 0,
  },
};
