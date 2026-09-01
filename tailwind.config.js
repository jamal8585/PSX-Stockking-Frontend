
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
        theme: {
          app: 'var(--color-bg-app)',
          surface: 'var(--color-bg-surface)',
          hover: 'var(--color-bg-hover)',
          text: 'var(--color-text-primary)',
          muted: 'var(--color-text-secondary)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent-primary)',
          accentHover: 'var(--color-accent-hover)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)'
        }
      },
      borderRadius: {
        'input': '8px',
        'btn': '8px',
        'card': '12px'
      }
    },
  },
  plugins: [],
}
