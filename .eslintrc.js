module.exports = {
  extends: ['airbnb-base'],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true
  },
  plugins: ['import', 'mocha'],
  globals: {},
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-underscore-dangle': [2, { "allow": ["foo_", "_fakerData"], "allowAfterThis": true  }],
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 1 }],
    'no-await-in-loop': 0,
    'no-unused-vars': 2,
    'no-param-reassign': 2,
    'no-restricted-syntax': 2,
    'linebreak-style': 0,
    semi: 0,
    'comma-dangle': 0,
    camelcase: 0
  }
}