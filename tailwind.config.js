/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brush: ['"Yuji Boku"', '"Shippori Mincho"', '"Yu Mincho"', '"Hiragino Mincho ProN"', 'serif'],
        mincho: ['"Shippori Mincho"', '"Zen Antique"', '"Yu Mincho"', '"Hiragino Mincho ProN"', 'serif'],
      },
      colors: {
        washi: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f4ede0',
          300: '#ebdcc5',
          800: '#3d3429',
          900: '#231d17',
        },
        indigo: {
          deep: '#101d2d',
          noren: '#182b42',
          light: '#2a4463',
        },
        wood: {
          light: '#e8d7be',
          base: '#c9a87c',
          dark: '#7c5328',
          deep: '#422a14',
        },
        vermilion: {
          stamp: '#c53d2f',
          deep: '#9c281c',
        },
        matcha: {
          light: '#84936d',
          base: '#536544',
          deep: '#36422c',
        }
      },
      backgroundImage: {
        'wood-pattern': "linear-gradient(to right, rgba(201, 168, 124, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 168, 124, 0.08) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
