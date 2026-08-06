import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#2A2A2A',
        input: '#2A2A2A',
        ring: '#E11D48',
        background: '#090909',
        foreground: '#FFFFFF',
        surface: '#171717',
        'surface-variant': '#2A2A2A',
        'surface-container': '#171717',
        'surface-container-high': '#1f1f1f',
        'surface-container-highest': '#2a2a2a',
        'surface-container-low': '#121212',
        'surface-container-lowest': '#090909',
        'on-surface': '#FFFFFF',
        'on-surface-variant': '#e5bdbe',
        primary: {
          DEFAULT: '#E11D48',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
        },
        tertiary: {
          DEFAULT: '#74D8BD',
          foreground: '#090909',
        },
        error: {
          DEFAULT: '#ffb4ab',
          foreground: '#690005',
        },
        outline: '#ac8889',
        'outline-variant': '#2A2A2A',
        destructive: {
          DEFAULT: '#ffb4ab',
          foreground: '#690005',
        },
        muted: {
          DEFAULT: '#1f1f1f',
          foreground: '#e5bdbe',
        },
        accent: {
          DEFAULT: '#1f1f1f',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#171717',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#171717',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
        DEFAULT: '10px',
        full: '9999px'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        unit: '4px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        gutter: '20px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        drawLine: {
          '0%': { strokeDasharray: '0, 1000' },
          '100%': { strokeDasharray: '1000, 0' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        pulseSubtle: 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        drawLine: 'drawLine 1s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
