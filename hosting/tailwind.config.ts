import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
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
