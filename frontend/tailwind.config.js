/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    "./public/index.html"
  ],
  important: true,
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#5a67d8',
          DEFAULT: '#4c51bf',
          dark: '#434190',
        },
        secondary: {
          light: '#ed64a6',
          DEFAULT: '#d53f8c',
          dark: '#b83280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
