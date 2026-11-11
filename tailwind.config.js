/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#061024',
        navy: {
          950: '#061024',
          900: '#0A1F44',
          800: '#0E2856',
          700: '#132F63',
          600: '#1E3A6E',
          500: '#2D4F88',
        },
        gold: {
          300: '#EBD488',
          400: '#DFBE63',
          500: '#C9A84C',
          600: '#A68735',
        },
        bull: '#10B981',
        bear: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
