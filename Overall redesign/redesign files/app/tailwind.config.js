/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E0F13",
          2: "#17181D",
          3: "#5B5F6A",
          4: "#8A8E99",
        },
        paper: {
          DEFAULT: "#FAFAFC",
          2: "#F4F4F8",
          3: "#ECECF2",
        },
        line: "#E5E5EB",
        violet: {
          DEFAULT: "#7B61FF",
          deep: "#6B51EF",
          soft: "#EFECFF",
          mist: "#F6F4FF",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        container: "76rem",
      },
    },
  },
  plugins: [],
};
