import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['node_modules/', 'dist/', 'src/prisma']),
  js.configs.recommended,
  ts.configs.recommended,
  {
    files: ['src/**/*.ts', '*.config.mjs'],
    plugins: { js, ts },
    extends: ['js/recommended', 'ts/recommended'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
