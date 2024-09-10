import { execSync } from 'child_process'

import postcssImport from 'postcss-import'
import tailwindcss from 'tailwindcss'
import tailwindcssNesting from 'tailwindcss/nesting'

import autoprefixer from 'autoprefixer'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

import tailwindConfig from './tailwind.config.ts'

import type { UserConfig } from 'vite'
// import postcssNesting from 'postcss-nesting';

const filesPathToExclude: (string | RegExp)[] = [/[-_]buildignore/]

// Function to get the current commit hash
function getCurrentCommitHash() {
  try {
    return execSync('git log -1 --format="%H"').toString().trim()
  } catch (error) {
    console.warn('Failed to get Git commit hash:', error)
    return 'unknown'
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ command, mode }) => {
  // console.log('MODE: ', process.env.NODE_ENV)
  console.log('MODE: ', mode)

  let title = 'Expt-Template Mode Unknown'
  if (mode === 'development') {
    title = 'Expt-Template Development'
  } else if (mode === 'production') {
    title = 'Expt-Template Production'
  }

  const config = {
    build: {
      target: browserslistToEsbuild(),
      manifest: true,
      rollupOptions: {
        external: filesPathToExclude,
      },
      // outDir: '../dist', // Output to the project root's dist folder
    },
    plugins: [
      createHtmlPlugin({
        minify: true,
      }),
    ],
    css: {
      postcss: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        plugins: [postcssImport, tailwindcssNesting, tailwindcss(tailwindConfig), autoprefixer],
        // plugins: {
        //   // 'postcss-import': {},
        //   'tailwindcss/nesting': 'postcss-nesting',
        //   'tailwindcss': {  },
        //   /* POSTCSS-PRESET-ENV: remove autoprefixer if you had it here, it's part of postcss-preset-env */
        //   'postcss-preset-env': {
        //     /* TAILWINDCSS: Note that if you are using postcss-preset-env in your project, you should make sure to disable nesting and let tailwindcss/nesting handle it for you instead: */
        //     features: { 'nesting-rules': false },
        //   },
        // },
      },
    },
    define: {
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(title),
      '__COMMIT_HASH__': JSON.stringify(getCurrentCommitHash()),
    },
    // resolve: {
    //   alias: {
    //     '@': srcDir,
    //   },
    // },
  } satisfies UserConfig
  return config
})
