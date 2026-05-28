import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E3',
          200: '#F2E5BA',
          300: '#E7D187',
          400: '#DCBE5B',
          500: '#ab8c52', // Muted Brand Gold (Radha)
          600: '#806430', // Brand Gold Hover (Radha)
          700: '#6d5427',
          800: '#523f1c',
          900: '#382a12',
          light: '#f5f2ec',
        },
        slate: {
          950: '#212121', // Dark Charcoal (Radha)
        },
      },
    },
  },
  plugins: [],
};
export default config;
