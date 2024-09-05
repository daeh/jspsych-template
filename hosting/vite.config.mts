import { execSync } from 'child_process'

import autoprefixer from 'autoprefixer'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

console.log('MODE: ', process.env.NODE_ENV)

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
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  define: {
    // Define the environment variable for the commit hash
    __COMMIT_HASH__: JSON.stringify(getCurrentCommitHash()),
  },
})
