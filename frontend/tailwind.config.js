/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core brand — a "celebration sunset" palette, deliberately warm and
        // joyful rather than the generic near-black/neon or cream/terracotta
        // defaults. Violet anchors the brand; pink and amber are the
        // celebratory accents used for CTAs, glows, and gradients.
        wish: {
          violet: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#100a24',
          },
          pink: {
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
          },
          amber: {
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
          },
          ink: {
            50: '#faf9fc',
            100: '#f1eef8',
            700: '#3f3960',
            800: '#241f3d',
            900: '#18142b',
            950: '#0f0b1a',
          },
        },
      },
      fontFamily: {
        // Display face carries the brand's celebratory personality;
        // body face stays neutral and highly legible for UI/forms.
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'wish-gradient': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 55%, #f59e0b 100%)',
        'wish-gradient-soft': 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 55%, #fef3c7 100%)',
        'wish-mesh-dark':
          'radial-gradient(circle at 15% 20%, rgba(139,92,246,0.35), transparent 40%), radial-gradient(circle at 85% 15%, rgba(236,72,153,0.28), transparent 45%), radial-gradient(circle at 50% 90%, rgba(245,158,11,0.18), transparent 50%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(76, 29, 149, 0.15)',
        'glass-lg': '0 20px 60px -10px rgba(76, 29, 149, 0.35)',
        glow: '0 0 40px rgba(236, 72, 153, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'orb-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'orb-float': 'orb-float 18s ease-in-out infinite',
        'orb-float-slow': 'orb-float 26s ease-in-out infinite reverse',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
