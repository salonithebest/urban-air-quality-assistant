/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#00b050", // 0-50
          satisfactory: "#92d050", // 51-100
          moderate: "#ffff00", // 101-200
          poor: "#ff9900", // 201-300
          veryPoor: "#ff0000", // 301-400
          severe: "#c00000", // 401-500
        },
      },
    },
  },
  plugins: [],
};
