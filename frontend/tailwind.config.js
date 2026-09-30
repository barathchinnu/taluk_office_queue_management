/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          500: '#1b3b6f',
          600: '#142d57',
          700: '#0f2942',
          800: '#0a1d30',
          900: '#071421',
        },
      },
    },
  },
  plugins: [],
}
