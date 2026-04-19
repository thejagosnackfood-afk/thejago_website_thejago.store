/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ffc107', // Kuning The Jago Store
          dark: '#f57c00',
        },
        secondary: '#1a237e', // Biru Tua
      },
    },
  },
  plugins: [],
}
