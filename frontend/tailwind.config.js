/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        mono:  ['IBM Plex Mono', 'monospace'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#d9eaff',
          200: '#bbd8ff',
          300: '#8abdff',
          400: '#4d9aff',
          500: '#1d77e0',
          600: '#1260cc',
          700: '#104da3',
          800: '#133f84',
          900: '#153768',
          950: '#0f2346',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.08)',
        'card-hover': '0 4px 24px rgba(0,0,0,.12)',
        'glow':  '0 0 24px rgba(29,119,224,.18)',
        'glow-teal': '0 0 24px rgba(20,184,166,.15)',
      },
      animation: {
        'fade-in': 'fadeIn .3s ease',
        'slide-up': 'slideUp .4s ease',
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },             to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.3' } },
      },
    },
  },
  plugins: [],
}
