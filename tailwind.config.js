/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./dist/**/*.{js,jsx,ts,tsx}"
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