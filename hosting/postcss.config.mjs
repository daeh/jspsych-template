export default {
  plugins: {
    // 'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    'tailwindcss': {},
    /* POSTCSS-PRESET-ENV: remove autoprefixer if you had it here, it's part of postcss-preset-env */
    'postcss-preset-env': {
      /* TAILWINDCSS: Note that if you are using postcss-preset-env in your project, you should make sure to disable nesting and let tailwindcss/nesting handle it for you instead: */
      features: { 'nesting-rules': false },
    },
  },
}
