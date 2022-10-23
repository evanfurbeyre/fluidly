/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: false,
    // themes: [
    //   {
    //     mytheme: {
    //       primary: "#a991f7",
    //       secondary: "#f6d860",
    //       accent: "#37cdbe",
    //       neutral: "#3d4451",
    //       "base-100": "#ffffff",
    //     },
    //   },
    // ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
}
