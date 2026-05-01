/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
      colors: {
        /* Legacy tokens — kept for backward compat */
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        /* Lavender glass tokens */
        lavender: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'bottom-nav': '4.5rem',
      },
      boxShadow: {
        'glass-sm':  '0 2px 12px rgba(139,92,246,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        'glass':     '0 4px 24px rgba(139,92,246,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'glass-lg':  '0 8px 40px rgba(139,92,246,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        'glow-sm':   '0 0 16px rgba(139,92,246,0.25)',
        'glow':      '0 0 32px rgba(139,92,246,0.3)',
        'glow-lg':   '0 0 48px rgba(139,92,246,0.35)',
        'purple-sm': '0 1px 3px rgba(139,92,246,0.15)',
        'purple':    '0 4px 12px rgba(139,92,246,0.2)',
        'purple-lg': '0 8px 24px rgba(139,92,246,0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.2)',
      },
      backgroundImage: {
        'gradient-lavender': 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)',
        'gradient-lavender-soft': 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
        'gradient-hero': 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 40%, #6366F1 80%, #818CF8 100%)',
        'orbs': `
          radial-gradient(900px circle at 10% 5%, rgba(196,181,253,0.18), transparent 50%),
          radial-gradient(700px circle at 85% 0%, rgba(237,233,254,0.14), transparent 55%),
          radial-gradient(900px circle at 60% 95%, rgba(139,92,246,0.1), transparent 55%)
        `,
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1) forwards',
        'slide-down': 'slideDown 0.25s ease-in forwards',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'mic-pulse': 'micPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        micPulse: {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '50%':  { transform: 'scale(1.25)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
