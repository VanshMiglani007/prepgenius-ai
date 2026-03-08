/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          hover: 'rgb(var(--color-primary-hover))',
          glow: 'rgba(var(--color-primary), 0.25)',
        },
        dark: {
          bg: 'rgb(var(--color-bg))',
          surface: 'rgba(var(--color-primary), 0.06)',
          surfaceHover: 'rgba(var(--color-primary), 0.08)',
        },
        error: '#ff6b6b'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
