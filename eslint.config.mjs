import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
    {
        files: ['**/*.{js,mjs}'],
        plugins: { js },
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
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: { sourceType: 'commonjs' },
    },
])
