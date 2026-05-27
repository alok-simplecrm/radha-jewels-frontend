import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E3',
          200: '#F2E5BA',
          300: '#E7D187',
          400: '#DCBE5B',
          500: '#D4AF37', // Premium Gold Color
          600: '#B69228',
          700: '#8F711E',
          800: '#695116',
          900: '#4D3A10',
        },
        slate: {
          950: '#030712',
        },
      },
    },
  },
  plugins: [],
};
export default config;
