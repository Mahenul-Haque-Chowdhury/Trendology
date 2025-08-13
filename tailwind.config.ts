import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
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
        brand: {
          // Refined brand palette: deeper blue for stronger contrast
          DEFAULT: '#1E6BD6',
          dark: '#1554A8',
        },
        accent: {
          // Warm accent for calls-to-action and highlights
          DEFAULT: '#FBC02D',
          dark: '#F9A825',
        },
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
