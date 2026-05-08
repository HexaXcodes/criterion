/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#0a0a0a',
          base: '#131313',
          elevated: '#1a1a1a',
          surface: '#1f1f1f',
        },
        pink: {
          neon: '#ff4b89',
          soft: '#ffb1c3',
          glow: '#ff6b9d',
          deep: '#993556',
        },
        teal: {
          neon: '#00dbe9',
          soft: '#5bf0fa',
          deep: '#009ab5',
        },
        text: {
          primary: '#e2e2e2',
          secondary: '#e5bcc4',
          muted: '#9a9a9a',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'fade-in': 'fadeIn 600ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'slide-down': 'slideDown 400ms ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'tail-wag': 'tailWag 0.6s ease-in-out infinite',
        'pet-hop': 'petHop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pet-jiggle': 'petJiggle 0.6s ease-in-out',
        'shimmer': 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 75, 137, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 75, 137, 0.7)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        tailWag: {
          '0%, 100%': { transform: 'rotate(-15deg)' },
          '50%': { transform: 'rotate(15deg)' },
        },
        petHop: {
          '0%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '70%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
        petJiggle: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '20%': { transform: 'scale(1.04, 0.97)' },
          '40%': { transform: 'scale(0.97, 1.03)' },
          '60%': { transform: 'scale(1.03, 0.98)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
