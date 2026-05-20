/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: '#AEFF57',
        success: '#57E8A3',
        warning: '#FFD557',
        danger: '#FF5252',
        bg: '#070707',
        bg2: '#0E0E0E',
        bg3: '#161616',
        bg4: '#1E1E1E',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}