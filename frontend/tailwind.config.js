/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: '#176E5B',
        'light-gray': '#E9EBEE',
        'screen-bg': '#f7f7f9',
        secondary: '#8D95A2',
        'light-green': '#DEE9E1',
        red: '#DA2A4B',
      },
      borderRadius: {
        'small-radius': '10px',
      },
      boxShadow: {
        card: '0px 6px 14px 0px #0E0E1A14',
        green: '0px 4px 12px 0px #00A58466',
      },
      backgroundImage: {
        'green-gradient':
          'linear-gradient(251.94deg, #4A9484 0%, #14735E 100%)',
      },
    },
  },
  plugins: [],
};
