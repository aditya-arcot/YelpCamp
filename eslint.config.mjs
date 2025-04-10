import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default defineConfig([
    {
        files: ['**/*.{js,mjs}'],
        plugins: {
            js,
            import: importPlugin,
        },
        extends: ['js/recommended'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            'no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                },
            ],
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                        'type',
                        'unknown',
                    ],
                    'newlines-between': 'never',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                    warnOnUnassignedImports: true,
                },
            ],
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: { sourceType: 'commonjs' },
    },
])
