/** @type {import('tailwindcss').Config} */
// Colores: única fuente en src/constants/colors.json (HU-05b). Los tokens semánticos son
// variables CSS con valor claro y oscuro; los `brand-*` son fijos (diseño de auth).
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
      colors: {
        ...Object.fromEntries(
          Object.keys(tokens.light).map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
        ),
        ...tokens.brand,
      },
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
