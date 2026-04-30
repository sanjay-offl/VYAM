/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        'purple-sm': '0 1px 3px rgba(165, 107, 255, 0.12)',
        'purple': '0 4px 12px rgba(165, 107, 255, 0.15)',
        'purple-lg': '0 8px 24px rgba(165, 107, 255, 0.2)',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, rgb(165, 107, 255) 0%, rgb(106, 61, 255) 100%)',
      },
    },
  },
  plugins: [],
}


