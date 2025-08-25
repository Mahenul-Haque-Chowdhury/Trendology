import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          md: '2rem',
          lg: '2rem',
          xl: '2rem',
        },
      },
      colors: {
        // Brand palette with shades for better states and backgrounds
        brand: {
          50: '#E6FFFB',
          100: '#C0FFF4',
          200: '#8AFAE7',
          300: '#5CF5E0',
          400: '#31E3D0',
          500: '#12C4B4',
          600: '#0FA099', // DEFAULT core (deep aqua)
          700: '#0B6F6B',
          800: '#074E4C',
          900: '#042F30',
          DEFAULT: '#0FA099',
          dark: '#0B6F6B',
          neon: '#5CF5E0',
        },
        ring: '#12C4B4',
        // Accent palette for highlights and secondary CTAs
        accent: {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FBC02D', // DEFAULT
          600: '#F9A825',
          700: '#F57F17',
          DEFAULT: '#FBC02D',
          dark: '#F9A825',
        },
        // Neutral (grays)
        neutral: colors.slate,
        // Semantic palettes
        success: colors.emerald,
        warning: colors.amber,
        danger: colors.rose,
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f7fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config
