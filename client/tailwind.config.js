/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface-container-lowest': '#0b0e12',
        'surface-container-low': '#191c20',
        'surface-container': '#1d2024',
        'surface-container-high': '#272a2e',
        'surface-container-highest': '#323539',
        'surface-bright': '#36393e',
        'surface-dim': '#111417',
        'surface': '#111417',
        'background': '#111417',

        'on-surface': '#e1e2e8',
        'on-surface-variant': '#c3c7cd',
        'outline': '#8d9197',
        'outline-variant': '#43474d',

        'primary': '#accae9',
        'primary-container': '#7895b2',
        'on-primary-container': '#0c2d46',

        'secondary': '#79daa6',
        'secondary-container': '#017a4f',
        'on-secondary-container': '#a5ffcc',

        'tertiary': '#edbf71',
        'tertiary-container': '#b48b43',

        'error': '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        'gutter': '1rem',
        'gutter-desktop': '1.5rem',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
};
