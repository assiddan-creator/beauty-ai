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
      boxShadow: {
        'glass':      '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'coral-glow': '0 4px 24px rgba(255,107,71,0.35)',
        'coral-sm':   '0 0 14px rgba(255,107,71,0.25)',
      },
      animation: {
        'blob-a': 'blob 9s ease-in-out infinite',
        'blob-b': 'blob 12s ease-in-out infinite 3s',
        'blob-c': 'blob 15s ease-in-out infinite 6s',
        'bg-fade': 'bgFade 1.2s ease-in-out forwards',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':       { transform: 'translate(20px, -20px) scale(1.05)' },
          '66%':       { transform: 'translate(-15px, 15px) scale(0.97)' },
        },
        bgFade: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        kenBurns: {
          '0%':   { transform: 'scale(1.0)  translate(0%,    0%)' },
          '25%':  { transform: 'scale(1.06) translate(-1.2%, -0.8%)' },
          '50%':  { transform: 'scale(1.1)  translate(1%,    0.6%)' },
          '75%':  { transform: 'scale(1.05) translate(0.8%,  -1%)' },
          '100%': { transform: 'scale(1.0)  translate(0%,    0%)' },
        },
      },
    },
  },
  plugins: [],
}
