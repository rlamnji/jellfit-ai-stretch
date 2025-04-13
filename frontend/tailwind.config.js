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
      }
    }
  },
  plugins: [],
}

