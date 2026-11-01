/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Albert Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Albert Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // F1 Hero Palette Tokens (docs/getdesign.md)
        'f1-dark': '#0a0e1c',
        'f1-card': 'rgba(20, 20, 30, 0.85)',
        'f1-yellow': '#EDB40B',
        'f1-gold': '#EDB40B',
        'f1-red': '#E10600',
        'f1-redDark': '#8B0000',
        'f1-glass': 'rgba(255, 255, 255, 0.12)',

        // VIVU Theme Role Colors (Upgraded for F1 Dark Glass)
        'app-bg': '#0a0e1c',
        'surface': '#14141e',
        'surface-subtle': '#1a1a28',
        'surface-dim': '#0f0f18',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a5b5',
        'text-muted': '#6b7280',
        'border-vivu': 'rgba(255, 255, 255, 0.12)',
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'action-primary': '#EDB40B',
        'action-hover': '#f5c32c',
        'action-active': '#d49e04',
        'neon-cyan': '#00E5FF',
        'neon-magenta': '#FF2A85',
        'semantic-success': '#10FFA0',
        'semantic-warning': '#EDB40B',
        'semantic-error': '#E10600',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideLeft: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeSlideRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        speedReveal: {
          '0%': { opacity: '0', transform: 'translateX(-100%) skewX(-8deg)', filter: 'blur(8px)' },
          '60%': { opacity: '1', transform: 'translateX(4%) skewX(-2deg)', filter: 'blur(0)' },
          '100%': { opacity: '1', transform: 'translateX(0) skewX(0)', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-down': 'fadeSlideDown 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-left': 'fadeSlideLeft 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-right': 'fadeSlideRight 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scaleIn 1s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.8s ease-out both',
        'speed-reveal': 'speedReveal 0.8s cubic-bezier(0.16,1,0.3,1) both',
      },
      borderRadius: {
        'phone': 'clamp(30px, 4vw, 54px)',
        'phone-screen': 'clamp(24px, 3.2vw, 44px)',
        'dock': '9999px',
        'card': '20px',
        'sheet': '32px',
      },
    },
  },
  plugins: [],
};
