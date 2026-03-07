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
          DEFAULT: '#00d4ff', // User's vibrant cyan
          hover: '#00b8d4',
          glow: 'rgba(0, 212, 255, 0.25)',
        },
        dark: {
          bg: '#1a1a2e',  // User's dark blue background
          surface: 'rgba(0, 212, 255, 0.06)',
          surfaceHover: 'rgba(0, 212, 255, 0.08)',
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
