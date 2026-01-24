/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", hover: "#1D4ED8" },
        success: "#10B981",
        danger: "#EF4444",
        muted: "#6B7280",
        background: "#F3F4F6"
      }
    },
  },
  plugins: [],
}