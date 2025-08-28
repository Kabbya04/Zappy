import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // This enables the dark theme toggler
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // You can add custom theme properties here if needed later
    },
  },
  plugins: [],
};
export default config;