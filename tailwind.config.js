
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        psx: {
          bg: '#0B0F19',
          card: '#111827',
          cardBorder: '#1F2937',
          bull: '#10B981',
          bullLight: '#D1FAE5',
          bear: '#EF4444',
          bearLight: '#FEE2E2',
          accent: '#3B82F6',
          gold: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
