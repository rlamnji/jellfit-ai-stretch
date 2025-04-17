/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 컴포넌트가 있는 위치
  ],
  theme: {
    extend: {
      colors: {
        'input-container-color' : '#FFF5E0',
        'input-text-color' : '#552F2F',
        'button-color' : '#552F2F',
        'disabled-button-color' : "#997F7F"
      },
      backgroundImage: {
        'space' : "url('./assets/images/etc/space.png')"
      },
      keyframes: {
        moveing: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        moveingCopy: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        moveing: 'moveing 2s ease-in-out infinite',
        moveingCopy: 'moveingCopy 2s ease-in-out infinite', // 애니메이션 충돌 방지용
      },

    }
  },
  plugins: [],
}




