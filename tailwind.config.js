/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this to be more specific to your nested 'src' structure
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/App.{js,jsx,ts,tsx}", 
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};