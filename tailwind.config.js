/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface:  '#1c1c1e',
        card:     '#2c2c2e',
        coral:    '#FF6B47',
        // kept for the slider glow / legacy references
        matte:    '#1c1c1e',
        charcoal: '#2c2c2e',
        steel:    '#4A90E2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
