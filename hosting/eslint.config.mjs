import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'
import defaultStylisticPlugin from '@stylistic/eslint-plugin'
import typescriptStylisticPlugin from '@stylistic/eslint-plugin-ts'
import javascriptStylisticPlugin from '@stylistic/eslint-plugin-js'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import pluginImportConfig from 'eslint-plugin-import/config/recommended.js'
import globals from 'globals'

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const projectDirname = dirname(fileURLToPath(import.meta.url))

const allTsExtensionsArray = ['ts', 'mts', 'cts', 'tsx', 'mtsx']
const allJsExtensionsArray = ['js', 'mjs', 'cjs', 'jsx', 'mjsx']
const allTsExtensions = allTsExtensionsArray.join(',')
const allJsExtensions = allJsExtensionsArray.join(',')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allExtensions = [...allTsExtensionsArray, ...allJsExtensionsArray].join(',')

const importRules = {
  'import/no-unresolved': 'error',
}

const baseRules = {
  'prettier/prettier': 'warn',
  '@stylistic/max-len': [
    'warn',
    { code: 120, ignoreComments: true, ignoreTrailingComments: true, ignoreStrings: true, ignoreUrls: true },
  ],
  '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
  '@stylistic/semi': ['error', 'never'],
  '@stylistic/quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
  '@stylistic/object-curly-spacing': ['warn', 'always'],
}

const typescriptRules = {}

const javascriptRules = {}

const typescriptRulesDev = {
  '@typescript-eslint/no-explicit-any': ['warn'],
  '@typescript-eslint/no-unsafe-assignment': ['warn'],
  '@typescript-eslint/no-unsafe-member-access': ['warn'],
  '@typescript-eslint/no-unsafe-return': ['warn'],
  '@typescript-eslint/no-unsafe-argument': ['warn'],
  '@typescript-eslint/no-unused-vars': ['off'],
  '@typescript-eslint/prefer-nullish-coalescing': ['off'],
  '@typescript-eslint/no-inferrable-types': ['off'],
  '@typescript-eslint/dot-notation': ['off'],
  'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
}

const javascriptRulesDev = {
  '@typescript-eslint/no-unused-vars': ['warn'],
  'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
}

const config = [
  {
    /* setup parser for all files */
    files: [`**/*.{${allTsExtensions},${allJsExtensions}}`],
    languageOptions: {
      sourceType: 'module',
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest', // 2024 sets the ecmaVersion parser option to 15
        tsconfigRootDir: resolve(projectDirname),
        project: './tsconfig.json',
      },
    },
  },
  {
    /* all typescript files, except config files */
    files: [`**/*.{${allTsExtensions}}`],
    ignores: [`**/*.config.{${allTsExtensions}}`],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': defaultStylisticPlugin,
      'import': pluginImport,
      'prettier': prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...pluginImportConfig.rules,
      ...typescriptEslintPlugin.configs['stylistic-type-checked'].rules,
      ...typescriptStylisticPlugin.configs['disable-legacy'].rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...typescriptEslintPlugin.configs['recommended-type-checked'].rules,
      //
      // ...typescriptEslintPlugin.configs.strict.rules,
      // ...typescriptEslintPlugin.configs['strict-type-checked'].rules,
      //
      ...importRules,
      ...baseRules,
      ...typescriptRules,
    },
  },
  {
    /* +lenient for typescript files in ./src/ folder */
    files: [`src/**/*.{${allTsExtensions}}`],
    ignores: [`**/*.config.{${allTsExtensions}}`],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts'],
        },
      },
      'import/ignore': ['node_modules/firebase'],
    },
    rules: {
      ...typescriptRulesDev,
    },
  },
  {
    /* +strict for typescript files NOT in ./src/ folder */
    files: [`**/*.{${allTsExtensions}}`],
    ignores: [`src/**/*.{${allTsExtensions}}`, `**/*.config.{${allTsExtensions}}`],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      ...typescriptEslintPlugin.configs.strict.rules,
      ...typescriptEslintPlugin.configs['strict-type-checked'].rules,
    },
  },
  {
    /* config files: typescript */
    files: [`**/*.config.{${allTsExtensions}}`],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': defaultStylisticPlugin,
      'import': pluginImport,
      'prettier': prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...typescriptEslintPlugin.configs['stylistic-type-checked'].rules,
      ...typescriptStylisticPlugin.configs['disable-legacy'].rules,
      ...baseRules,
      ...typescriptRules,
      '@typescript-eslint/prefer-nullish-coalescing': ['off'],
    },
  },
  {
    /* all javascript files, except config */
    files: [`**/*.{${allJsExtensions}}`],
    ignores: [`**/*.config.{${allJsExtensions}}`],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': defaultStylisticPlugin,
      'import': pluginImport,
      'prettier': prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...pluginImportConfig.rules,
      ...typescriptEslintPlugin.configs['stylistic'].rules,
      ...javascriptStylisticPlugin.configs['disable-legacy'].rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...typescriptEslintPlugin.configs['recommended-type-checked'].rules,
      //
      // ...typescriptEslintPlugin.configs.strict.rules,
      // ...typescriptEslintPlugin.configs['strict-type-checked'].rules,
      //
      ...importRules,
      ...baseRules,
      ...javascriptRules,
      ...javascriptRulesDev,
    },
  },
  {
    /* config files: typescript */
    files: [`**/*.config.{${allTsExtensions}}`],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': defaultStylisticPlugin,
      'import': pluginImport,
      'prettier': prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...typescriptEslintPlugin.configs['stylistic-type-checked'].rules,
      ...typescriptStylisticPlugin.configs['disable-legacy'].rules,
      ...baseRules,
      ...typescriptRules,
      '@typescript-eslint/prefer-nullish-coalescing': ['off'],
    },
  },
  {
    /* config files: javascript */
    files: [`**/*.config.{${allJsExtensions}}`],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': defaultStylisticPlugin,
      'import': pluginImport,
      'prettier': prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      ...typescriptEslintPlugin.configs['stylistic'].rules,
      ...javascriptStylisticPlugin.configs['disable-legacy'].rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...typescriptEslintPlugin.configs['recommended-type-checked'].rules,
      ...typescriptEslintPlugin.configs.strict.rules,
      ...baseRules,
      ...javascriptRules,
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-unsafe-call': ['off'],
      '@typescript-eslint/no-unsafe-member-access': ['off'],
      '@typescript-eslint/no-unsafe-assignment': ['off'],
    },
  },
  {
    ignores: ['dist/*', 'build/*', 'scripts/*'],
  },
]

export default config
