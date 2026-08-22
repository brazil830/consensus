/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0F17',
          darker: '#07090F',
          card: '#111827',
          panel: '#1E293B',
          elevated: '#1F2937',
        },
        brand: {
          cyan: '#38BDF8',
          emerald: '#64E6A5',
          amber: '#F5C76B',
          coral: '#FF6B6B',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          sky: '#70B7FF',
        },
        status: {
          success: '#64E6A5',
          warning: '#F5C76B',
          danger: '#FF6B6B',
          info: '#70B7FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-spin': 'spin 30s linear infinite',
        'subtle-glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 5px rgba(100, 230, 165, 0.3))' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 15px rgba(100, 230, 165, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
