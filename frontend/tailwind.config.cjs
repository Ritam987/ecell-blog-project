/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: '#00ffff',
        neonPink: '#ff00ff',
        neonGreen: '#39ff14',
        darkBg: '#0f0f1a',
        cardBg: '#1a1a2e',
        textLight: '#f5f5f5',
        graySoft: '#b0b0b0',
      },
      boxShadow: {
        neon: '0 0 8px #00ffff, 0 0 15px #ff00ff',
        neonHover: '0 0 12px #39ff14, 0 0 25px #ff00ff',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
