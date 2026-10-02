/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Ensure dynamic colour strings aren't purged
    'bg-navy-900', 'bg-navy-800',
    'text-church-blue', 'bg-church-blue',
    'text-church-gold', 'bg-church-gold',
    'bg-church-cream', 'bg-church-light',
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
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(30,58,95,0.08), 0 1px 2px -1px rgba(30,58,95,0.06)',
        'card-hover': '0 4px 12px 0 rgba(30,58,95,0.12)',
        glow: '0 0 0 3px rgba(30,58,95,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
