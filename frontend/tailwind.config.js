/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vivu: {
          bg: '#F3F7F8',
          surface: '#FFFFFF',
          text: '#14252E',
          secondary: '#52646D',
          muted: '#7E909A',
          border: '#D8E3E7',
          action: '#0A8395',
          'action-hover': '#086E7D',
          neon: '#00E5FF',
          magenta: '#FF2A85',
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
          // Backward compatibility mappings
          ivory: '#F3F7F8',
          cream: '#FFFFFF',
          tint: '#EEF3F5',
          peach: '#0A8395',
          'peach-soft': '#ECF5F7',
          sage: '#059669',
          sky: '#0A8395',
          'sky-tint': '#E8F4F6',
          mocha: '#14252E',
          cocoa: '#52646D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'vivu-card': '0 2px 8px rgba(20, 37, 46, 0.04), 0 1px 2px rgba(20, 37, 46, 0.02)',
        'vivu-dock': '0 4px 16px rgba(20, 37, 46, 0.08), 0 1px 3px rgba(20, 37, 46, 0.04)',
        'vivu-modal': '0 12px 36px rgba(20, 37, 46, 0.12), 0 2px 8px rgba(20, 37, 46, 0.04)',
        'vivu-accent': '0 2px 10px rgba(10, 131, 149, 0.25)',
      }
    },
  },
  plugins: [],
}
