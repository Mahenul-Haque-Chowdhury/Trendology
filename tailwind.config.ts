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
          50: '#eef5ff',
          100: '#e2edff',
          200: '#c5dbfe',
          300: '#9fbffe',
          400: '#6f9bfa',
          500: '#3f77f0',
          600: '#1E6BD6', // DEFAULT tone
          700: '#1554A8',
          800: '#0e3c79',
          900: '#092956',
          DEFAULT: '#1E6BD6',
          dark: '#1554A8',
        },
        ring: '#1E6BD6',
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
