/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matte: '#0A0A0A',
        charcoal: '#141414',
        steel: '#4A90E2',
      },
    },
  },
  plugins: [],
}
