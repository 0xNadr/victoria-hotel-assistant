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
        // Clar AI inspired palette
        'clar': {
          primary: '#10b981',
          'primary-light': '#34d399',
          accent: '#8b5cf6',
          dark: '#0f172a',
          muted: '#64748b',
        },
        // Keep dormero for compatibility during transition
        'dormero-red': '#10b981', // Map to clar primary (green)
        'dormero-dark': '#0f172a',
      },
      boxShadow: {
        'glass': 'inset 0 0 24px rgba(255, 255, 255, 0.8)',
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}
export default config
