/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red:      '#e30613',
          darkred:  '#b80010',
          blue:     '#1a3a5c',
          darkblue: '#0f2540',
          gold:     '#c89b2a',
          bg:       '#f4f4f4',
          text:     '#1a1a1a',
          muted:    '#777777',
          border:   '#dddddd',
          footer:   '#1a1a1a',
          light:    '#f9f9f9',
        },
      },
      fontFamily: {
        bengali: ['"Shurjo"', '"Anek Bangla"', '"SolaimanLipi"', '"Kalpurush"', '"Hind Siliguri"', '"Noto Sans Bengali"', 'Arial', 'sans-serif'],
        'bengali-serif': ['"Shurjo"', '"Noto Serif Bengali"', '"SolaimanLipi"', 'serif'],
        headline: ['"Shurjo"', '"Anek Bangla"', '"SolaimanLipi"', '"Hind Siliguri"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.14)',
      },
      lineHeight: {
        bengali: '2.0',
      },
    },
  },
  plugins: [],
}
