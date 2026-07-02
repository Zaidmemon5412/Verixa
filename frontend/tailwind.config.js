/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e1ecff',
          200: '#c3d8ff',
          300: '#94b9ff',
          400: '#5c8fff',
          500: '#3366ff', // Primary Brand Color
          600: '#254bdb',
          700: '#1d3bb7',
          800: '#1c3293',
          900: '#1c2d75',
        },
        verification: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          pending: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
