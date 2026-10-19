/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-navy-900', 'bg-navy-800',
    'text-church-blue', 'bg-church-blue',
    'text-church-gold', 'bg-church-gold',
    'bg-church-cream', 'bg-church-light',
    'section-header--light',
    // card variant classes used dynamically
    'card-light', 'card-dark',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4fb',
          100: '#dce6f5',
          200: '#b9cde9',
          300: '#88a8d5',
          400: '#5a83be',
          500: '#3b64a8',
          600: '#2e508e',
          700: '#274374',
          800: '#1e3a5f',   // = church-blue
          900: '#162d4a',
          950: '#0d1e31',
        },
        church: {
          blue:   '#1e3a5f',
          gold:   '#c9a84c',
          cream:  '#fdfaf3',
          light:  '#f4f7fb',
          border: '#e8edf4',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'Noto Sans Telugu', 'system-ui', 'sans-serif'],
        serif:  ['Lora', 'Georgia', 'Cambria', 'serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
      },
      borderRadius: {
        // Soft shape scale
        'xl':  '0.75rem',   // 12px — buttons
        '2xl': '1rem',      // 16px — inputs, modals, admin cards
        '3xl': '1.5rem',    // 24px — public content cards
        '4xl': '2rem',      // 32px — hero glass card
      },
      boxShadow: {
        // Light-band card (white on cream)
        'card':       '0 2px 8px -2px rgba(22,45,74,0.10), 0 0 0 1px rgba(22,45,74,0.05)',
        'card-hover': '0 10px 30px -12px rgba(22,45,74,0.25), 0 0 0 1px rgba(22,45,74,0.08)',
        // Dark-band card (translucent on navy)
        'card-dark':  '0 4px 20px -6px rgba(0,0,0,0.35)',
        // Pastor avatar glow ring
        'avatar':     '0 0 0 3px #c9a84c, 0 0 0 5px rgba(201,168,76,0.25)',
        // Glass / hero
        'glass':      '0 4px 24px 0 rgba(0,0,0,0.20)',
        // Focus ring (glow)
        'glow':       '0 0 0 3px rgba(30,58,95,0.18)',
      },
      transitionTimingFunction: {
        flow: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '700': '700ms',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up':  'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'hero-zoom': 'heroZoom 22s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },   to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        heroZoom: {
          from: { transform: 'scale(1)' },
          to:   { transform: 'scale(1.08)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}
