import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

console.log('MODE: ', process.env.NODE_ENV)

const filesPathToExclude = ['eslint.config.js']
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
})
