/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        fd_reg: ["Fredoka_400Regular"],
        fd_semibold: ["Fredoka_600SemiBold"],
        fd_bold: ["Fredoka_700Bold"],
      },
      colors: {
        fontColor: 'black',
        selectedTabFontColor: "#1D5AD0",
        selectedTabBGColor: "#7090C133",
        tabBGColor: "#DDEEFA",
        starColor: "#F9D232",
      },
    },
  },
  plugins: [],
}