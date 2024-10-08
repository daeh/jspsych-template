import type { Config } from 'tailwindcss'

export default {
  content: ['./hosting/index.html', './hosting/src/**/*.{html,js,ts}', './hosting/src/styles/*.css'],
  // purge: ['./*.html', './src/**/*.{vue,js,ts,jsx,tsx,css}'],
  // darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
} satisfies Config
