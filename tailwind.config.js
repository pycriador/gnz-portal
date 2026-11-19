/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--portal-primary-rgb) / <alpha-value>)',
          light: 'rgb(var(--portal-green-light-rgb) / <alpha-value>)',
          charcoal: 'rgb(var(--portal-charcoal-rgb) / <alpha-value>)',
          accent: 'rgb(var(--portal-craft-rgb) / <alpha-value>)',
          craft: 'rgb(var(--portal-craft-rgb) / <alpha-value>)',
          straw: 'rgb(var(--portal-straw-rgb) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
