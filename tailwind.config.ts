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
      },
      colors: {
        brand: {
          black:      '#0A0A0A',
          white:      '#FFFFFF',
          cream:      '#FAF7F0',          // légèrement plus chaud
          // ── Gold scale ──────────────────────────────────────
          gold: {
            DEFAULT:  '#845300',          // principal — AA compliant
            light:    '#A66800',          // hover / highlight
            dark:     '#5C3A00',          // deep accent
            soft:     '#C9954A',          // subtle backgrounds / borders
          },
          // ── Retrocompat alias ────────────────────────────────
          warm:       '#845300',          // = brand-gold, préserve les usages existants
        },
      },
      letterSpacing: {
        widest: '0.3em',
      },
      transitionTimingFunction: {
        'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
