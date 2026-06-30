/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Добавьте эту строку вот сюда
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
