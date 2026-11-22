/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0E1917',
          900: '#0B1413',
          800: '#101C1A',
        },
        surface: {
          DEFAULT: '#132420',
          light: '#1A302A',
          border: '#254038',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E0BE4E',
          dim: '#8A7220',
        },
        mint: {
          DEFAULT: '#4FD1AE',
          light: '#8FE9CE',
          dim: '#2E9678',
        },
        coral: {
          DEFAULT: '#E2725B',
        },
        parchment: {
          DEFAULT: '#EDE7DA',
          dim: '#B9C4BE',
          faint: '#7E938C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(0,0,0,0.55)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
