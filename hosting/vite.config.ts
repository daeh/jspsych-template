import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import browserslistToEsbuild from 'browserslist-to-esbuild'

export default defineConfig({
  build: {
    target: browserslistToEsbuild(),
  },
  // @ts-ignore
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
  ],
})
