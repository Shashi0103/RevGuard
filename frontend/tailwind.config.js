/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        surface: '#12141D',
        'surface-hover': '#1A1D2B',
        border: '#1E2333',
        primary: {
          DEFAULT: '#D4AF37', // Amber / Gold accent
          hover: '#F3C63F',
          muted: 'rgba(212, 175, 55, 0.15)'
        },
        accent: {
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
          blue: '#3B82F6',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
