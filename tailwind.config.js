/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366',
          dark: '#003366',
        },
        secondary: {
          DEFAULT: '#0055A5',
          blue: '#0055A5',
        },
        accent: {
          DEFAULT: '#0077CC',
          blue: '#0077CC',
        },
        light: {
          bg: '#F5F7FA',
        }
      },
    },
  },
  plugins: [],
}
