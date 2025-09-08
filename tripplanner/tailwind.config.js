/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { colors: {
        'cream': '#F1EADF', 
        'darkblue': '#17637B',
        'lightblue': '#94B9B9',
        'red': '#EB4320',
        'lightorange': '#EDB489',
        'darkorange' : '#C25941',
        'warmcream':'#f4f3ec',
        'background':'#FFFDF5',
        'primary': '#95B1EE',
        'secondary2':'#364C84',
        'secondary1':'#D0D9F5',
        'accent1': '#E7F1AB',
        'accent2':'#333333'
       
      },
      fontFamily: {
        didact: ['"Didact Gothic"', 'sans-serif'],
        cardo: ['"Cardo"', 'serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      
      },
      fontSize:{
        base: '14px'
      },
      boxShadow: {
        custom: '0px 0px 100px 2px rgba(148, 185, 185, 0.1)',
      },
    },
  },
  plugins: [],
}