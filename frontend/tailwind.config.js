/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kyk: {
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#eab308',
          bg: '#f8fafc',
          card: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
