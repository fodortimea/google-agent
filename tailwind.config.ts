import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#766CA8", // dark blue
        message: "#8E83A5", // light blue
        accent: "#C2B8DA",
        background: "#ffffff", // white
      },
    },
  },
  plugins: [],
} satisfies Config;
