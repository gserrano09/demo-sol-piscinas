/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      // ✅ Adiciona classes font-{weight} usadas no JSX (font-500, font-600, font-700, font-800)
      fontWeight: {
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      colors: {
        brand: {
          50:  '#f0faf5',
          100: '#dcf2e7',
          200: '#bbe5d1',
          300: '#86d0b2',
          400: '#4ab48a',
          500: '#006847',
          600: '#005c3f',
          700: '#004d35',
          800: '#003d29',
          900: '#002e1f',
          950: '#001a11',
        },
        accent: '#6EC43A',
        slate: {
          DEFAULT: '#3D5266',
          light:   '#6b8ca8',
          dark:    '#273545',
        },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        'card-lg': '0 4px 6px rgba(0,0,0,.04), 0 12px 48px rgba(0,0,0,.08)',
        'brand':   '0 8px 32px rgba(0,104,71,.18)',
      },
      animation: {
        'fade-up':  'fadeUp .5s ease both',
        'fade-in':  'fadeIn .4s ease both',
        'slide-in': 'slideIn .35s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}

module.exports = config
