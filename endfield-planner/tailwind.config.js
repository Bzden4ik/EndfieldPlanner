/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        endfield: {
          bg: '#060709',
          card: '#0c0e12',
          border: '#1a1d24',
          hover: '#14171d',
        }
      },
      fontFamily: {
        game: ['Rajdhani', 'Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
