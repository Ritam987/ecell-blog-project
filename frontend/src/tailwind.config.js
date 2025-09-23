/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",   // scan all React components
    "./index.css",           // scan CSS at frontend root
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
