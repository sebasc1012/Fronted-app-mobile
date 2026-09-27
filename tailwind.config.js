/** @type {import('tailwindcss').Config} */
// Colores: única fuente en src/constants/colors.json (HU-05b). Cada token es una variable
// CSS: claro en :root y oscuro con prefers-color-scheme. Las paletas de alto contraste
// (HU-07) se aplican en tiempo de ejecución con vars() (ver ColorScope en colors.tsx).
const tokens = require("./src/constants/colors.json");

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
const cssVars = (palette) =>
  Object.fromEntries(Object.entries(palette).map(([name, hex]) => [`--color-${name}`, channels(hex)]));

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: Object.fromEntries(
        Object.keys(tokens.light).map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
      ),
    },
  },

  plugins: [
    ({ addBase }) =>
      addBase({
        ":root": cssVars(tokens.light),
        "@media (prefers-color-scheme: dark)": { ":root": cssVars(tokens.dark) },
      }),
  ],
};
