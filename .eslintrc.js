module.exports = {
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'env': {
    'browser': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    "plugin:@react-three/recommended"
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    '@typescript-eslint'
  ],
  'rules': {
    'indent': [
      'error',
      2
    ],
    'no-unused-vars': ['warn', {
      'vars': 'all',
      'args': 'none',
    }],
    'prefer-const': [
      'warn'
    ],
    'react/prop-types': [
      'warn'
    ],
    'react/no-unescaped-entities': [
      'off'
    ],
    'no-mixed-spaces-and-tabs': [
      'off'
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ]
  },
  'overrides': [
    {
      'files': ["**/*.tsx"],
      'rules': {
        'react/no-unknown-property': "off"
      }
    }
  ]
}
