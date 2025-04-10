/* eslint-disable @typescript-eslint/naming-convention */

import { execSync } from 'node:child_process'

import tailwindcss from '@tailwindcss/vite'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

// import type { AcceptedPlugin } from 'tailwindcss/node_modules/postcss'
// import type { AcceptedPlugin } from 'postcss'
// import type { AcceptedPlugin } from 'tailwindcss/stubs/postcss.config'
import type { UserConfig } from 'vite'

const filesPathToExclude: (string | RegExp)[] = [/[-_]buildignore/]

// Function to get the current commit hash
function getCurrentCommitHash(): string {
  try {
    return execSync('git log -1 --format="%H"').toString().trim()
  } catch (error) {
    console.warn('Failed to get Git commit hash:', error)
    return 'gitCommitHashUnknown'
  }
}

export default defineConfig(({ command, mode }) => {
  console.log('VITE COMMAND:', command)
  console.log('VITE MODE:', mode)
  console.log('NODE MODE:', process.env.NODE_ENV)

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
      tailwindcss(),
      createHtmlPlugin({
        minify: true,
      }),
    ],
    css: {
      postcss: './postcss.config.cjs',
    },
    define: {
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(title),
      '__COMMIT_HASH__': JSON.stringify(getCurrentCommitHash()),
    },
  } satisfies UserConfig
  return config
})
