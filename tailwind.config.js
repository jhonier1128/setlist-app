/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a2e',
        },
        background: {
          light: '#f8fafc',
          dark: '#0f0f1a',
        },
      },
      fontFamily: {
        mono: ['SpaceMono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'chord-lg': ['1.25rem', { lineHeight: '1.8', letterSpacing: '0.02em' }],
        'chord-xl': ['1.5rem', { lineHeight: '2', letterSpacing: '0.02em' }],
        'chord-2xl': ['2rem', { lineHeight: '2.5', letterSpacing: '0.02em' }],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  presets: [require('nativewind/preset')],
}