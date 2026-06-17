import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default defineConfig(
    globalIgnores(['dist', 'coverage', 'cypress/screenshots', 'cypress/videos']),
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' },
            ],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            // Patrón habitual en hooks de datos (fetch al montar); revisar caso a caso.
            'react-hooks/set-state-in-effect': 'warn',
            // React Compiler: deps manuales en useCallback; revisar al adoptar compiler.
            'react-hooks/preserve-manual-memoization': 'warn',
        },
    },
    {
        files: ['vite.config.ts', 'eslint.config.ts', 'cypress.config.ts'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ['cypress/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.mocha,
                cy: 'readonly',
                Cypress: 'readonly',
            },
        },
    },
    {
        files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    }
);
