import { execSync } from 'child_process'

import autoprefixer from 'autoprefixer'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import tailwindcss from 'tailwindcss'
import tailwindcssNesting from 'tailwindcss/nesting'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

import tailwindConfig from './tailwind.config'

import type { UserConfig } from 'vite'

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

export default defineConfig(({ command, mode }) => {
  console.log('VITE COMMAND: ', command)
  console.log('VITE MODE: ', mode)
  console.log('NODE MODE: ', process.env.NODE_ENV)

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
        plugins: [tailwindcssNesting, tailwindcss(tailwindConfig), autoprefixer],
      },
    },
    define: {
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(title),
      '__COMMIT_HASH__': JSON.stringify(getCurrentCommitHash()),
    },
  } satisfies UserConfig
  return config
})
