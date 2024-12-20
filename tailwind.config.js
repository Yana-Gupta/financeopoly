/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sour-gummy': ['"Sour Gummy"', 'serif'],
        'pt-serif': ["PT Serif Caption", 'serif'],
        'nunito-sans': ['"Nunito Sans"', 'serif'],
      },


    },
  },
  plugins: [],
}

