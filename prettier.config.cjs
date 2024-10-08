/** @type {import("prettier").Config} */
const config = {
  printWidth: 120,
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'consistent',
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: 'always',
  proseWrap: 'never',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.ts',
  overrides: [
    {
      files: ['*.html'],
      options: {
        printWidth: 200,
        singleQuote: false,
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'css',
      },
    },
    {
      files: ['*.md'],
      options: {
        proseWrap: 'preserve',
      },
    },
    {
      files: ['*.json'],
      options: {
        printWidth: 400,
        trailingComma: 'es5',
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.code-workspace', '.vscode/*.json'],
      options: {
        parser: 'json5',
        quoteProps: 'preserve',
        trailingComma: 'none',
        singleQuote: false,
        printWidth: 200,
        bracketSameLine: false,
      },
    },
  ],
}

module.exports = config
