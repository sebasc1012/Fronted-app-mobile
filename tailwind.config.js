/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        danger: "#DC2626",
      },
    },
  },

  plugins: [],
};
