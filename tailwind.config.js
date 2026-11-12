/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        news: '0 12px 30px rgba(8, 121, 181, 0.12)',
      },
      colors: {
        brand: {
          blue: '#0879B5',
          dark: '#08679C',
          secondary: '#1685B9',
          light: '#8FBCC8',
          yellow: '#FFC83D',
          gray: '#F1F3F5',
          border: '#D5D9DC',
          text: '#333333',
          muted: '#666666',
        },
      },
    },
  },
  plugins: [],
}
