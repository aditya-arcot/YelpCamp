import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
})

export default [
    {
        ignores: [
            '**/.DS_Store',
            '**/node_modules/',
            '**/.env',
            'seeds/locations.js',
            'seeds/seedHelpers.js',
        ],
    },
    ...compat.extends('eslint:recommended'),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.node,
            },

            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            indent: ['error', 4],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
        },
    },
]
