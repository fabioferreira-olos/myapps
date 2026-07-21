/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        ui: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      colors: {
        orange: {
          DEFAULT: '#FB5C28',
          light: '#ff7a4d',
          glow: 'rgba(251,92,40,0.25)',
        },
        accent: {
          DEFAULT: '#5E6AD2',
          light: '#818CF8',
          glow: 'rgba(94,106,210,0.12)',
        },
        sky: '#0EA5E9',
        status: {
          green: '#22C55E',
          'green-bg': 'rgba(34,197,94,0.10)',
          'green-border': 'rgba(34,197,94,0.20)',
          amber: '#F59E0B',
          'amber-bg': 'rgba(245,158,11,0.10)',
          'amber-border': 'rgba(245,158,11,0.20)',
          red: '#EF4444',
          'red-bg': 'rgba(239,68,68,0.10)',
          'red-border': 'rgba(239,68,68,0.20)',
        },
        oid: {
          text: '#EDEDEF',
          sub: '#c8d2dc',
          muted: '#b2bfd1',
          bg: '#00001a',
          surface: 'rgba(255,255,255,0.12)',
          'surface-hover': 'rgba(255,255,255,0.18)',
          'surface-soft': 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.10)',
          'border-soft': 'rgba(255,255,255,0.07)',
          'border-strong': 'rgba(255,255,255,0.18)',
        },
      },
      borderRadius: {
        'oid-lg': '24px',
        'oid-md': '16px',
        'oid-sm': '12px',
        'oid-xs': '10px',
        'oid-xxs': '8px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.07)',
        'glass-strong': '0 32px 80px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.10)',
        'orange-glow': '0 4px 20px rgba(251,92,40,0.40)',
        'orange-glow-lg': '0 8px 32px rgba(251,92,40,0.40)',
      },
      backdropBlur: {
        glass: '24px',
        'glass-strong': '32px',
      },
      saturate: {
        glass: '1.3',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-dot': 'pulseDot 1.4s ease infinite',
        'blob-1': 'blobDrift1 22s ease-in-out infinite',
        'blob-2': 'blobDrift2 28s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        blobDrift1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        blobDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-30px, 40px) scale(0.95)' },
          '66%': { transform: 'translate(25px, -15px) scale(1.05)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
