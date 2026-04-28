import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#FF6B9D',
          cyan: '#00D2FF',
          gold: '#FFD700',
          purple: '#9B5DE5',
          green: '#00F5A0',
          orange: '#FF6B35',
          red: '#FF4757',
          blue: '#4169E1',
        },
        stage: {
          dark: '#0A0A1A',
          card: '#12122A',
          border: '#2A2A4A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'rainbow': 'rainbow 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'dance': 'dance 0.5s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'particle': 'particle 4s ease-in-out infinite',
        'wave': 'wave 2s linear infinite',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'note-float': 'noteFloat 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(155, 93, 229, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(155, 93, 229, 1), 0 0 60px rgba(0, 210, 255, 0.5)' },
        },
        rainbow: {
          '0%': { color: '#FF6B9D' },
          '16%': { color: '#FF6B35' },
          '33%': { color: '#FFD700' },
          '50%': { color: '#00F5A0' },
          '66%': { color: '#00D2FF' },
          '83%': { color: '#9B5DE5' },
          '100%': { color: '#FF6B9D' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        dance: {
          '0%': { transform: 'rotate(-5deg) scaleY(0.95)' },
          '100%': { transform: 'rotate(5deg) scaleY(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-10vh) scale(1)', opacity: '0' },
        },
        wave: {
          '0%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        noteFloat: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-60px) rotate(20deg)', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-stage': 'linear-gradient(180deg, #0A0A1A 0%, #12082A 50%, #0A1A2A 100%)',
        'neon-border': 'linear-gradient(90deg, #FF6B9D, #9B5DE5, #00D2FF, #00F5A0, #FFD700, #FF6B35, #FF6B9D)',
      },
    },
  },
  plugins: [],
}

export default config
