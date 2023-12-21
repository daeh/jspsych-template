import { execSync } from 'child_process'

import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

console.log('MODE: ', process.env.NODE_ENV)

const filesPathToExclude: (string | RegExp)[] = []

// Function to get the current commit hash
function getCurrentCommitHash() {
  try {
    return execSync('git log -1 --format="%H"').toString().trim()
  } catch (error) {
    console.warn('Failed to get Git commit hash:', error)
    return 'unknown'
  }
}

export default defineConfig({
  build: {
    target: browserslistToEsbuild(),
    manifest: true,
    rollupOptions: {
      external: filesPathToExclude,
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
  ],
  define: {
    // Define the environment variable for the commit hash
    __COMMIT_HASH__: JSON.stringify(getCurrentCommitHash()),
  },
})
