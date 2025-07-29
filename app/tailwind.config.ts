import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 和風カラーパレット
        washi: {
          50: '#fefefe',
          100: '#fcfcfc',
          200: '#f8f8f8',
          300: '#f0f0f0',
          400: '#e8e8e8',
          500: '#d8d8d8',
        },
        sumi: {
          50: '#f7f7f7',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#a8a8a8',
          400: '#7a7a7a',
          500: '#5a5a5a',
          600: '#4a4a4a',
          700: '#3a3a3a',
          800: '#2a2a2a',
          900: '#1a1a1a',
        },
        // 日本の伝統色
        sakura: {
          50: '#fef7f7',
          100: '#fdeaea',
          200: '#fbd5d5',
          300: '#f7b2b2',
          400: '#f18a8a',
          500: '#e85d5d',
          600: '#d63c3c',
          700: '#b32d2d',
          800: '#942929',
          900: '#7c2828',
        },
        matcha: {
          50: '#f6f8f4',
          100: '#e9f0e4',
          200: '#d4e2ca',
          300: '#b5cfa3',
          400: '#92b876',
          500: '#739f54',
          600: '#5a7f40',
          700: '#486535',
          800: '#3c522d',
          900: '#344527',
        },
        indigo: {
          50: '#f0f4f8',
          100: '#d9e6f2',
          200: '#b3cde0',
          300: '#6ba3d0',
          400: '#4a90c2',
          500: '#2e7cb8',
          600: '#1e5f8c',
          700: '#1a4971',
          800: '#183d5b',
          900: '#17334d',
        },
        // アクセントカラー
        gold: {
          50: '#fffbf0',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      transitionDuration: {
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
export default config