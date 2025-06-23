const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Configuração base
  js.configs.recommended,

  // Arquivos a ignorar
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      'tmp/**',
      'coverage/**',
      '.nx/**',
      '.cache/**',
      '.parcel-cache/**',
      'documentation/**'
    ]
  },

  // Configuração para arquivos TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null // Não usar projeto para evitar problemas
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Desabilitar regras que podem causar problemas
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off'
    }
  },

  // Configuração para arquivos JavaScript
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  },

  // Configuração para arquivos de teste
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.js',
      '**/*.test.ts',
      '**/*.test.js',
      '**/tests/**/*.ts',
      '**/tests/**/*.js'
    ],
    languageOptions: {
      parser: tsParser,
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  },

  // Configuração para arquivos de configuração
  {
    files: [
      'jest.config.ts',
      'jest.config.js',
      '*.config.ts',
      '*.config.js',
      'commitlint.config.js'
    ],
    languageOptions: {
      parser: tsParser
    },
    rules: {
      'no-useless-escape': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
];
