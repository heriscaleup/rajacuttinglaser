/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0D0C',
        surface: '#121514',
        container: '#191D1B',
        border: '#303531',
        primary: '#8E9690',
        highlight: '#D8DED8',
        accent: '#E8642D',
        'accent-blue': '#799C92',
        'accent-orange': '#FF8A4C',
        button: '#E8642D',
        'text-main': '#F3F0E8',
        'text-secondary': '#A7ADA8',
        paper: '#E8E4D9',
        ink: '#111311',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
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
        'hero-mesh': 'linear-gradient(135deg, #0B0D0C 0%, #171A18 52%, #0B0D0C 100%)',
      },
      boxShadow: {
        'glow': '0 20px 60px rgba(0,0,0,0.26)',
        'glow-lg': '0 32px 100px rgba(0,0,0,0.38)',
      },
    },
  },
  plugins: [],
}
