/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#141414',
        surface: '#1a1a1a',
        container: '#222222',
        border: '#333333',
        primary: '#888888',
        highlight: '#AAAAAA',
        accent: '#FF6B00',
        'accent-blue': '#0066FF',
        'accent-orange': '#FFAA00',
        button: '#FF6B00',
        'text-main': '#FFFFFF',
        'text-secondary': '#AAAAAA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,0,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,107,0,0.5)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'linear-gradient(135deg, #141414 0%, #1a1a1a 50%, #141414 100%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(255,107,0,0.15)',
        'glow-lg': '0 0 60px rgba(255,107,0,0.25)',
      },
    },
  },
  plugins: [],
}
