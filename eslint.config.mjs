/* eslint-disable @typescript-eslint/ban-ts-comment */

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import stylisticPlugin from '@stylistic/eslint-plugin'
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

const projectDirname = dirname(fileURLToPath(import.meta.url))

const context = (() => {
  if (typeof process.env.NODE_ENV === 'undefined') return 'default'
  if (process.env.NODE_ENV === 'development') return 'development'
  if (process.env.NODE_ENV === 'production') return 'production'
  new Error('Invalid NODE_ENV')
  return 'error'
})()

const tsconfig = (() => {
  if (context === 'default') return './tsconfig.json'
  if (context === 'development') return './tsconfig.dev.json'
  if (context === 'production') return './tsconfig.prod.json'
  new Error('Invalid context')
  return 'error'
})()

const allTsExtensionsArray = ['ts', 'mts', 'cts', 'tsx', 'mtsx']
const allJsExtensionsArray = ['js', 'mjs', 'cjs', 'jsx', 'mjsx']
const allTsExtensions = allTsExtensionsArray.join(',')
const allJsExtensions = allJsExtensionsArray.join(',')
const allExtensions = [...allTsExtensionsArray, ...allJsExtensionsArray].join(',')

const importRules = {
  ...importPlugin.flatConfigs.recommended.rules,
  'import/named': 'error',
  'import/no-unresolved': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      prefer: 'type-imports',
      disallowTypeAnnotations: true,
      fixStyle: 'inline-type-imports',
    },
  ],
  '@typescript-eslint/no-import-type-side-effects': 'error',
  'sort-imports': [
    'error',
    {
      allowSeparatedGroups: true,
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    },
  ],
  'import/order': [
    'error',
    {
      'groups': [
        'builtin', // Built-in imports (come from NodeJS native) go first
        'external', // External imports
        'internal', // Absolute imports
        'parent', // Relative imports
        'sibling', // Relative imports
        // ['sibling', 'parent'], // Relative imports, the sibling and parent types they can be mingled together
        'index', // index imports
        'type', // type imports
        'object', // object imports
        'unknown', // unknown
      ],
      'pathGroups': [
        {
          pattern: '*.png',
          group: 'unknown',
          position: 'after',
          patternOptions: { matchBase: true },
        },
        {
          pattern: '*.jpg',
          group: 'unknown',
          position: 'after',
          patternOptions: { matchBase: true },
        },
      ],
      'newlines-between': 'always',
      'distinctGroup': true,
      'alphabetize': {
        order: 'asc',
        caseInsensitive: true, // ignore case
      },
    },
  ],
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
  '@stylistic/array-element-newline': ['error', 'consistent'],
}

const typescriptRules = {
  ...prettierConfig.rules,
  ...typescriptEslintPlugin.configs.recommended.rules,
  ...typescriptEslintPlugin.configs['recommended-type-checked'].rules,
  ...typescriptEslintPlugin.configs.strict.rules,
  ...typescriptEslintPlugin.configs['strict-type-checked'].rules,
  ...typescriptEslintPlugin.configs['stylistic-type-checked'].rules,
  ...stylisticPlugin.configs['disable-legacy'].rules,
  ...importRules,
  ...baseRules,
  '@typescript-eslint/no-unused-vars': ['warn'],
}

const javascriptRules = {
  ...prettierConfig.rules,
  ...typescriptEslintPlugin.configs.recommended.rules,
  ...typescriptEslintPlugin.configs.strict.rules,
  ...typescriptEslintPlugin.configs.stylistic.rules,
  ...stylisticPlugin.configs['disable-legacy'].rules,
  ...importRules,
  ...baseRules,
}

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
  '@typescript-eslint/no-unnecessary-condition': ['warn'],
}

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    /* setup parser for all files */
    files: [`**/*.{${allExtensions}}`],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest', // 2024 sets the ecmaVersion parser option to 15
        sourceType: 'module',
        tsconfigRootDir: resolve(projectDirname),
        project: tsconfig,
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
      // @ts-ignore
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': stylisticPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...typescriptRules,
    },
  },
  {
    /* +lenient for typescript files in ./src/ folder */
    files: [`hosting/src/**/*.{${allTsExtensions}}`, `build-pubmods-pubignore/hosting/src/**/*.{${allTsExtensions}}`],
    ignores: [`**/*.config.{${allTsExtensions}}`],
    settings: {
      'import/resolver': {
        node: {
          /* for jspsyc */
        },
        typescript: {
          project: tsconfig,
          alwaysTryTypes: true,
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
      /* for firebase */
      'import/ignore': ['node_modules/firebase'],
    },
    rules: {
      ...typescriptRules,
      ...typescriptRulesDev,
    },
  },
  {
    /* config files: typescript */
    files: [`**/*.config.{${allTsExtensions}}`],
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    plugins: {
      // @ts-ignore
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': stylisticPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...typescriptRules,
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
      // @ts-ignore
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': stylisticPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...javascriptRules,
    },
  },
  {
    /* config files: javascript */
    files: [`**/*.config.{${allJsExtensions}}`],
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    plugins: {
      // @ts-ignore
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': stylisticPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...javascriptRules,
    },
  },
  {
    /* utility scripts: javascript */
    files: [`./scripts/*.{${allJsExtensions}}`],
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    plugins: {
      // @ts-ignore
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic': stylisticPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...javascriptRules,
    },
  },
  {
    ignores: [
      /* specialized ignore patterns */
      '**/*_lintignore*',
      '**/*-lintignore*',
      '**/*_buildignore*',
      '**/*-buildignore*',
      /* generated directories */
      '.yarn/',
      '**/node_modules/',
      '.firebase/',
      'hosting/dist/',
      'build/',
      '_build/',
      /* generated files */
      '*.lock',
      '*-lock.*',
      '.pnp.*',
      'vite.config.mts.timestamp-*.mjs',
      /* editor config */
      '**/.vscode/',
      '**/.idea/',
      /* project specific patterns */
    ],
  },
]

export default config
