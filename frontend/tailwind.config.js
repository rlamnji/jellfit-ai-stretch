/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 컴포넌트가 있는 위치
  ],
  theme: {
    extend: {
      keyframes: {
        moveing: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        moveing: 'moveing 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}




