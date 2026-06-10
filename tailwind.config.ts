import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
      colors: {
        brand: {
          black:      '#0A0A0A',
          white:      '#FFFFFF',
          cream:      '#FAF7F0',
          gold: {
            DEFAULT:  '#845300',
            light:    '#A66800',
            dark:     '#5C3A00',
            soft:     '#C9954A',
          },
          warm:       '#845300',
        },
      },
      letterSpacing: {
        widest: '0.3em',
      },
      transitionTimingFunction: {
        'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'expo-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      keyframes: {
        'ken-burns': {
          '0%':   { transform: 'scale(1.02) translate3d(0, 0, 0)' },
          '100%': { transform: 'scale(1.12) translate3d(-1%, -1.5%, 0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'marquee': {
          '0%':   { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'scroll-cue': {
          '0%':        { transform: 'translateY(-30%)', opacity: '0' },
          '20%, 70%':  { opacity: '1' },
          '100%':      { transform: 'translateY(60%)', opacity: '0' },
        },
        'gold-sweep': {
          '0%':   { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-100% center' },
        },
      },
      animation: {
        'ken-burns': 'ken-burns 8s ease-out forwards',
        'shimmer': 'shimmer 2.2s linear infinite',
        'marquee': 'marquee 28s linear infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'scroll-cue': 'scroll-cue 1.8s ease-in-out infinite',
        'gold-sweep': 'gold-sweep 4s linear infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(120deg, #5C3A00 0%, #845300 30%, #C9954A 50%, #845300 70%, #5C3A00 100%)',
        'gold-line': 'linear-gradient(90deg, transparent 0%, #C9954A 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
