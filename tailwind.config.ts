import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ─── Design System Tokens ─────────────────────────────────────────────
      colors: {
        brand: {
          orange:       '#FF6500',
          'orange-hover': '#e55a00',
          navy:         '#1E3E62',
          dark:         '#0B192C',
          black:        '#000000',
        },
        // Status de leads
        status: {
          novo:     { DEFAULT: '#A1B5CC', bg: 'rgba(30,62,98,0.15)',   border: 'rgba(30,62,98,0.30)' },
          contato:  { DEFAULT: '#FF6500', bg: 'rgba(255,101,0,0.10)', border: 'rgba(255,101,0,0.25)' },
          proposta: { DEFAULT: '#F59E0B', bg: 'rgba(245,158,11,0.10)',border: 'rgba(245,158,11,0.25)' },
          fechado:  { DEFAULT: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)' },
          perdido:  { DEFAULT: '#6B7280', bg: '#27272a',              border: '#52525B' },
        },
        // Canais de lead
        canal: {
          instagram: { DEFAULT: '#F472B6', bg: 'rgba(244,114,182,0.10)' },
          whatsapp:  { DEFAULT: '#4ADE80', bg: 'rgba(74,222,128,0.10)'  },
          indicacao: { DEFAULT: '#60A5FA', bg: 'rgba(96,165,250,0.10)'  },
          outro:     { DEFAULT: '#A1B5CC', bg: 'rgba(30,62,98,0.20)'    },
        },
      },

      // ─── Tipografia ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Escala do design system
        'display': ['3.75rem', { lineHeight: '1', fontWeight: '900' }],  // text-6xl
        'title':   ['1.5rem',  { lineHeight: '1.3', fontWeight: '700' }], // text-2xl
        'heading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // text-xl
        'micro':   ['0.625rem',{ lineHeight: '1.4', fontWeight: '500' }], // 10px
      },

      // ─── Border Radius (design system) ───────────────────────────────────
      borderRadius: {
        badge:  '6px',
        card:   '12px',
        panel:  '16px',
      },

      // ─── Box Shadow (glass morphism) ──────────────────────────────────────
      boxShadow: {
        'glass-card':
          '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)',
        'glass-metric':
          '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-hover':
          '0 0 0 1px rgba(255,101,0,0.25), 0 8px 32px rgba(0,0,0,0.5)',
        'drag-active':
          '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,101,0,0.4)',
      },

      // ─── Backdrop Blur customizado ────────────────────────────────────────
      backdropBlur: {
        'glass-card':    '20px',
        'glass-metric':  '16px',
        'glass-overlay': '24px',
        'glass-nav':     '12px',
        'lead-backdrop': '2px',
      },

      // ─── Animações ────────────────────────────────────────────────────────
      transitionDuration: {
        DEFAULT: '150ms',
        panel:   '300ms',
      },
      transitionTimingFunction: {
        panel: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glass-shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'slide-up':      'slide-up 200ms ease-out',
        'fade-in':       'fade-in 150ms ease-out',
        'glass-shimmer': 'glass-shimmer 1.5s ease',
      },
    },
  },
  plugins: [],
} satisfies Config
