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
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2', // DEFAULT tone (Crystal Teal core)
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          DEFAULT: '#0891B2',
          dark: '#0E7490',
        },
        ring: '#0891B2',
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
