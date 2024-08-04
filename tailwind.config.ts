/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 1s ease-in-out",
      },
      boxShadow: {
        "custom-multi":
          "rgba(6, 182, 212, 0.4) 5px 5px, rgba(6, 182, 212, 0.3) 10px 10px, rgba(6, 182, 212, 0.2) 15px 15px, rgba(6, 182, 212, 0.1) 20px 20px, rgba(6, 182, 212, 0.5) 25px 25px",
      },
      backgroundImage: {
        "message-gradient":
          "linear-gradient(37deg, rgba(0, 255, 119, 0) 40%, rgba(1, 0, 20, 1) 50%)",
      },
    },
  },
  plugins: [],
};
