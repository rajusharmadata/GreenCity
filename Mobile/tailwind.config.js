/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a34a", // green-600
          light: "#dcfce7",   // green-100
          dark: "#14532d",    // green-900
        },
        accent: "#f59e0b",    // amber-500
        background: "#f0fdf4", // green-50
      },
    },
  },
  plugins: [],
}
