/** @type {import('tailwindcss').Config} */
const colors = require("./constants/colors");
module.exports = {
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './utils/**/*.{html,js,jsx,ts,tsx,mdx}',
    './*.{html,js,jsx,ts,tsx,mdx}',
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: colors.primary_color,
        white: colors.color_white,
        text_primary: colors.text_primary,
        text_secondary: colors.text_secondary,
        text_title: colors.text_title,
        text_body: colors.text_body,
        text_tertiary: colors.text_tertiary,
        black: colors.black,
        textOutline: colors.textOutlineColor,
        dashboard: colors.dashboardColors
      },
      fontFamily: {
        'work-sans': ['WorkSans_400Regular'],
        'worksansMedium': ['WorkSans_500Medium'],
        'worksanssemibold': ['WorkSans_600SemiBold'],
        'worksansBold': ['WorkSans_800ExtraBold'],
        'inter': ['Inter_400Regular'],
        'intersemibold': ['Inter_500Medium'],
        'interbold': ['Inter_700Bold'],
        'interextrabold': ['Inter_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
