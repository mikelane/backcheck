import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        property: {
          DEFAULT: '#3b82f6',
          dim: '#1d4ed8',
          glow: 'rgba(59,130,246,0.3)',
        },
        llc: {
          DEFAULT: '#a855f7',
          dim: '#7e22ce',
          glow: 'rgba(168,85,247,0.3)',
        },
        human: {
          DEFAULT: '#f97316',
          dim: '#c2410c',
          glow: 'rgba(249,115,22,0.4)',
        },
        agent: {
          DEFAULT: '#6b7280',
          dim: '#374151',
          glow: 'rgba(107,114,128,0.3)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        reveal: 'reveal 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
