/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4648d4",
          container: "#6063ee",
          light: "#6366f1",
          hover: "#3b3dbf",
          fixed: "#e1e0ff",
          dim: "#c0c1ff",
          dark: "#07006c"
        },
        secondary: {
          DEFAULT: "#4b41e1",
          container: "#645efb",
          fixed: "#e2dfff",
          dim: "#c3c0ff",
          dark: "#0f0069"
        },
        surface: {
          DEFAULT: "#f9f9ff",
          bright: "#f9f9ff",
          dim: "#d3daea",
          lowest: "#ffffff",
          low: "#f0f3ff",
          container: "#e7eefe",
          high: "#e2e8f8",
          highest: "#dce2f3",
          variant: "#dce2f3"
        },
        darkSurface: {
          DEFAULT: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          accent: "#1e1b4b"
        },
        onSurface: {
          DEFAULT: "#151c27",
          variant: "#464554"
        },
        outline: {
          DEFAULT: "#767586",
          variant: "#c7c4d7"
        },
        tertiary: {
          DEFAULT: "#904900",
          container: "#b55d00",
          fixed: "#ffdcc5"
        },
        success: {
          DEFAULT: "#10b981",
          container: "#d1fae5",
          dark: "#065f46"
        },
        warning: {
          DEFAULT: "#f59e0b",
          container: "#fef3c7",
          dark: "#92400e"
        },
        danger: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          dark: "#93000a"
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px'
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'floating': '0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 35px rgba(99, 102, 241, 0.5)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}