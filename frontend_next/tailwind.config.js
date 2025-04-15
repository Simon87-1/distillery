/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: '#176E5B',
        'light-gray': '#E9EBEE',
        'screen': '#f7f7f9',
        secondary: '#8D95A2',
        'light-green': '#DEE9E1',
        red: '#DA2A4B',
        black: '#0E0E0E',
        gray: '#969696',
      },
      borderRadius: {
        'small': '10px',
        'medium': '14px',
      },
      boxShadow: {
        card: '0px 6px 14px 0px #0E0E1A14',
        green: '0px 0px 4px 0px #00A58499',
        red: '0px 0px 4px 0px #F1244A99',
        drop: '0px 4px 16px 0px #0E0E1A33',
        filter: '0px 4px 4px 0px #00000014',
        'green-btn': '0px 4px 12px 0px #00A58466',
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(251.94deg, #4A9484 0%, #14735E 100%)',
        'green-dark-gradient': 'linear-gradient(251.94deg, #14584A 0%, #143736 100%)',
      },
    },
  },
  plugins: [],
};
