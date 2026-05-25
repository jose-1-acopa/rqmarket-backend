/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Tipografías corporativas ─────────────────────────────────
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },

      // ── Paleta cromática ─────────────────────────────────────────
      colors: {
        // Brand (azul corporativo)
        brand: {
          50:  '#F5F9FF',
          100: '#E6F0FF',
          200: '#C4DBFE',
          300: '#92BCFB',
          400: '#5F9DF7',
          500: '#1F75FE',  // azul brillante (acento)
          600: '#0E4DA4',  // azul corporativo (PRIMARY)
          700: '#0B3E83',  // hover
          800: '#082E62',
          900: '#051F42',
        },

        // Ink (grises cálidos - slate)
        ink: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Semánticos
        success: {
          DEFAULT: '#00875A',
          bg: '#E3FCEF',
          border: '#79F2C0',
        },
        warning: {
          DEFAULT: '#DE7C00',
          bg: '#FFF4E5',
          border: '#FFC078',
        },
        danger: {
          DEFAULT: '#C9302C',
          bg: '#FFEBEE',
          border: '#FFB4AB',
        },
      },

      // ── Bordes (B2B prefiere bordes más cuadrados) ───────────────
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },

      // ── Sombras refinadas ────────────────────────────────────────
      boxShadow: {
        'sm':  '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'DEFAULT': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'md':  '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'lg':  '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'xl':  '0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        'inner': 'inset 0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        'focus': '0 0 0 3px rgba(31, 117, 254, 0.2)',
      },

      // ── Escala tipográfica precisa ───────────────────────────────
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'md':   ['15px', { lineHeight: '24px' }],
        'lg':   ['16px', { lineHeight: '26px' }],
        'xl':   ['18px', { lineHeight: '28px' }],
        '2xl':  ['22px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        '3xl':  ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '4xl':  ['36px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
        '5xl':  ['48px', { lineHeight: '56px', letterSpacing: '-0.03em' }],
        '6xl':  ['60px', { lineHeight: '64px', letterSpacing: '-0.03em' }],
      },

      // ── Animaciones sutiles ──────────────────────────────────────
      transitionDuration: {
        DEFAULT: '180ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
