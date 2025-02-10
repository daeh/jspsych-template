/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import jseslint from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const projectDirname = dirname(fileURLToPath(import.meta.url))

const context = process.env.NODE_ENV ?? 'default'
if (!['default', 'development', 'production'].includes(context)) {
  throw new Error(`Invalid NODE_ENV value: ${context}`)
}
const tsconfig = (() => {
  if (context === 'default') return './tsconfig.json'
  if (context === 'development') return './tsconfig.dev.json'
  if (context === 'production') return './tsconfig.prod.json'
  new Error('Invalid context')
  return 'error'
})()

const allTsExtensionsArray = ['ts', 'mts', 'cts']
const allJsExtensionsArray = ['js', 'mjs', 'cjs']
const allExtensionsArray = [...allTsExtensionsArray, ...allJsExtensionsArray]
const allTsExtensions = allTsExtensionsArray.join(',')
const allJsExtensions = allJsExtensionsArray.join(',')
const allExtensions = allExtensionsArray.join(',')

export default tseslint.config(
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

  /* Prerolled configs */
  jseslint.configs.recommended,
  // eslintPluginImport.flatConfigs.recommended,
  // eslintPluginImport.flatConfigs.typescript,
  ...tseslint.configs.recommendedTypeChecked,
  // ...tseslint.configs.strictTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  stylisticPlugin.configs['recommended-flat'],
  stylisticPlugin.configs['disable-legacy'],

  /* All Files */
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsconfig,
        tsconfigRootDir: projectDirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [tsconfig],
        },
        node: {
          // extensions: ['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx'],
        },
      },
      // 'import/extensions': ['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx'],
      // 'import/external-module-folders': ['node_modules', 'node_modules/@types'],
      // 'import/ignore': ['node_modules/firebase'],
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      /* Stylistic */
      'prettier/prettier': ['warn'],
      '@stylistic/max-len': [
        'warn',
        { code: 120, ignoreComments: true, ignoreTrailingComments: true, ignoreStrings: true, ignoreUrls: true },
      ],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
      '@stylistic/member-delimiter-style': [
        'warn',
        {
          multiline: {
            delimiter: 'none',
            requireLast: false,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
      '@stylistic/operator-linebreak': ['warn', 'after'], /// DEBUG temp disabled until prettier 3.5 supports experimentalOperatorPosition
      '@stylistic/indent-binary-ops': ['off'], /// DEBUG temp disabled until prettier 3.5 supports experimentalOperatorPosition
    },
  },

  // All TypeScript files
  {
    files: [`**/*.{${allTsExtensions}}`],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      /* Import */
      ...eslintPluginImport.flatConfigs.recommended.rules,
      ...eslintPluginImport.flatConfigs.typescript.rules,
      'import/no-unresolved': 'error',
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
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      /////////////

      'no-extra-boolean-cast': 'off',
      'no-alert': 'error',
      'no-self-compare': 'error',
      'no-unreachable-loop': 'error',
      'no-template-curly-in-string': 'error',
      'no-unused-private-class-members': 'error',
      'no-extend-native': 'error',
      'no-floating-decimal': 'error',
      'no-implied-eval': 'error',
      'no-iterator': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-new-object': 'error',
      'no-proto': 'error',
      'no-useless-catch': 'error',
      'one-var-declaration-per-line': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-destructuring': 'warn',
      'prefer-exponentiation-operator': 'error',
      'prefer-promise-reject-errors': 'warn',
      'prefer-regex-literals': 'error',
      'prefer-spread': 'warn',
      'prefer-template': 'warn',
      // 'require-await': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',

      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],

      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            Object: {
              message: 'Avoid using the `Object` type. Did you mean `object`?',
              fixWith: 'object',
            },

            Function: {
              message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
            },

            Boolean: {
              message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
              fixWith: 'boolean',
            },

            Number: {
              message: 'Avoid using the `Number` type. Did you mean `number`?',
              fixWith: 'number',
            },

            String: {
              message: 'Avoid using the `String` type. Did you mean `string`?',
              fixWith: 'string',
            },

            Symbol: {
              message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
              fixWith: 'symbol',
            },
          },
        },
      ],

      '@typescript-eslint/consistent-type-assertions': 'error',

      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],

      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',

          overrides: {
            accessors: 'explicit',
          },
        },
      ],

      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: false,
        },
      ],

      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: ['objectLiteralProperty'],
          leadingUnderscore: 'allow',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],

          filter: {
            regex: '(^[a-z]+:.+)|_attr|[0-9]',
            match: false,
          },
        },
      ],

      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      // '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-require-imports': 'error',

      '@typescript-eslint/no-shadow': [
        'error',
        {
          hoist: 'all',
        },
      ],

      // '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-readonly': 'error',

      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          path: 'always',
          types: 'prefer-import',
          lib: 'always',
        },
      ],

      '@typescript-eslint/typedef': [
        'warn',
        {
          parameter: true,
          propertyDeclaration: true,
        },
      ],

      '@typescript-eslint/unified-signatures': 'error',
      // 'arrow-body-style': 'error',
      'complexity': 'off',
      'consistent-return': 'error',
      'constructor-super': 'error',
      // 'curly': 'error',
      // 'dot-notation': 'off',
      'eqeqeq': ['error', 'smart'],
      'guard-for-in': 'error',

      'id-denylist': [
        'error',
        'any',
        'Number',
        'number',
        'String',
        'string',
        'Boolean',
        'boolean',
        'Undefined',
        'undefined',
      ],

      'id-match': 'error',
      // 'import/no-default-export': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/no-internal-modules': 'off',
      // 'sort-imports': [
      //   'error',
      //   {
      //     allowSeparatedGroups: true,
      //     ignoreDeclarationSort: true,
      //   },
      // ],
      // 'import/order': [
      //   'error',
      //   {
      //     'groups': [['external', 'builtin'], 'internal', ['sibling', 'parent', 'index']],
      //     'newlines-between': 'always',
      //     'pathGroups': [
      //       { pattern: '@file/**/*', group: 'internal' },
      //       { pattern: '@file/**', group: 'internal' },
      //       { pattern: '@export/**', group: 'internal' },
      //     ],
      //     'pathGroupsExcludedImportTypes': ['internal'],
      //     'alphabetize': {
      //       order: 'asc',
      //       caseInsensitive: true,
      //     },
      //   },
      // ],
      'indent': 'off',
      // 'jsdoc/check-alignment': 'error',
      // 'jsdoc/check-indentation': 'off',
      'max-classes-per-file': 'off',
      'max-len': 'off',
      'new-parens': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      // 'no-duplicate-imports': 'error',
      'no-empty': 'error',
      'no-empty-function': 'off',
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-fallthrough': 'off',
      'no-invalid-this': 'off',
      'no-multiple-empty-lines': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'error',
      'no-redeclare': 'error',
      'no-return-await': 'error',
      'no-sequences': 'error',
      'no-shadow': 'off',
      'no-sparse-arrays': 'error',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',

      // 'no-underscore-dangle': [
      //   'error',
      //   {
      //     allow: ['_attr'],
      //   },
      // ],

      'no-unsafe-finally': 'error',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'error',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'error',
      'no-var': 'error',
      'object-shorthand': 'off',
      'one-var': ['error', 'never'],
      // 'prefer-arrow/prefer-arrow-functions': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'radix': 'error',
      'space-in-parens': ['error', 'never'],

      // 'spaced-comment': [
      //   'error',
      //   'always',
      //   {
      //     markers: ['/'],
      //   },
      // ],

      //   // 'unicorn/filename-case': 'error',
      //   // 'unicorn/prefer-ternary': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'off',

      //   // 'functional/immutable-data': [
      //   //   'error',
      //   //   {
      //   //     ignoreImmediateMutation: true,
      //   //     ignoreAccessorPattern: ['**.root*', '**.numberingReferences*', '**.sections*', '**.properties*'],
      //   //   },
      //   // ],

      //   // 'functional/prefer-property-signatures': 'error',
      //   // 'functional/no-mixed-types': 'error',
      //   // 'functional/prefer-readonly-type': 'error',

      //   // '@typescript-eslint/no-unused-vars': [
      //   //   'error',
      //   //   {
      //   //     argsIgnorePattern: '^[_]+$',
      //   //   },
      //   // ],
    },
  },

  {
    files: [`hosting/**/*.{${allTsExtensions}}`],
    // extends: [
    //   ...tseslint.configs.recommendedTypeChecked,
    //   ...tseslint.configs.strictTypeChecked,
    //   ...tseslint.configs.stylisticTypeChecked,
    // ],
    // plugins: {
    //   import: eslintPluginImport,
    // },
    rules: {
      '@typescript-eslint/no-explicit-any': ['warn'],
      '@typescript-eslint/no-unsafe-assignment': ['warn'],
      '@typescript-eslint/no-unsafe-member-access': ['warn'],
      '@typescript-eslint/no-unsafe-return': ['warn'],
      '@typescript-eslint/no-unsafe-argument': ['warn'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
      '@typescript-eslint/no-inferrable-types': ['off'],
      '@typescript-eslint/dot-notation': ['warn'],
      '@typescript-eslint/no-unnecessary-condition': ['warn'],
    },
  },

  // JS files
  {
    files: [`**/*.{${allJsExtensions}}`],
    extends: [jseslint.configs.recommended],
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      ...eslintPluginImport.flatConfigs.recommended.rules,
      'import/no-unresolved': 'error',
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
          'newlines-between': 'always',
          'distinctGroup': true,
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true, // ignore case
          },
        },
      ],
    },
  },
)
