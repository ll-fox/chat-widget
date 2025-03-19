/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/client/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'sm': '0.875rem', // 14px
        'xs': '0.75rem',  // 12px
      }
    },
  },
  plugins: [],
}