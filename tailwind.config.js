/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8e7",
          100: "#faefc3",
          200: "#f5de87",
          300: "#efc94b",
          400: "#e8b422",
          500: "#C9A227",
          600: "#a8811a",
          700: "#856015",
          800: "#634816",
          900: "#4a3514",
        },
        brown: {
          50: "#f5ede8",
          100: "#e8d5c9",
          200: "#d4b09a",
          300: "#b8836a",
          400: "#9a5f45",
          500: "#7a4430",
          600: "#5c3020",
          700: "#3D2314",
          800: "#2C1810",
          900: "#1a0e09",
        },
      },
    },
  },
  plugins: [],
};
