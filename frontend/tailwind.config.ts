import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050508',
        violet: '#7C3AED',
        gold: '#F59E0B',
        glacier: '#F0F4FF',
        cyan: '#00FFD1',
        coral: '#FF4D6D',
        emerald: '#00FF88'
      },
      fontFamily: {
        display: ['Clash Display', 'Satoshi', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        shimmer: 'shimmer 2.4s linear infinite',
        gridFly: 'gridFly 12s linear infinite',
        orbit: 'orbit 1.4s linear infinite',
        cursorBlink: 'cursorBlink 0.8s steps(2) infinite',
        scan: 'scan 2.6s linear infinite',
        ringCw: 'ringCw 12s linear infinite',
        ringCcw: 'ringCcw 10s linear infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        gridFly: {
          '0%': { transform: 'translateY(-48px)' },
          '100%': { transform: 'translateY(48px)' }
        },
        orbit: {
          '100%': { transform: 'rotate(360deg)' }
        },
        cursorBlink: {
          '0%,45%': { opacity: '1' },
          '46%,100%': { opacity: '0' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(260%)' }
        },
        ringCw: {
          '100%': { transform: 'rotate(360deg)' }
        },
        ringCcw: {
          '100%': { transform: 'rotate(-360deg)' }
        }
      }
    }
  },
  plugins: [typography]
} satisfies Config;
