/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#14141F',
        container: '#1E1E2A',
        border: '#2A2A3A',
        primary: '#C0C0C0',
        highlight: '#E5E5E5',
        accent: '#00FF88',
        'accent-blue': '#0066FF',
        'accent-orange': '#FF6B00',
        button: '#00FF88',
        'text-main': '#FFFFFF',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,255,136,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,136,0.8)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'linear-gradient(135deg, #0A0A0F 0%, #14141F 50%, #0A0A0F 100%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(0,255,136,0.15)',
        'glow-lg': '0 0 60px rgba(0,255,136,0.25)',
        'neon': '0 0 20px rgba(0,255,136,0.5), 0 0 40px rgba(0,255,136,0.3)',
      },
    },
  },
  plugins: [],
}