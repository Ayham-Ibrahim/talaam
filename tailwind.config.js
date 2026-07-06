/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B5998',
          hover: '#2E477A',
          light: '#E8ECF5',
        },
        accent: {
          pink: '#C2185B',
          purple: '#7E57C2',
        },
        success: '#2E9E6B',
        'success-light': '#E3F5EC',
        star: '#F5A623',
        price: '#2F80ED',
        ink: {
          DEFAULT: '#1A1A2E',
          soft: '#6B7280',
        },
        line: '#E5E7EB',
        surface: '#FFFFFF',
        canvas: '#F7F8FA',
      },
      fontFamily: {
        sans: ['Cairo', '"IBM Plex Sans Arabic"', 'Tajawal', 'system-ui', 'sans-serif'],
        cairo: ['Cairo', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        pill: '20px',
      },
      boxShadow: {
        soft: '0 4px 16px rgba(0,0,0,0.06)',
        card: '0 2px 12px rgba(0,0,0,0.05)',
        lift: '0 8px 28px rgba(0,0,0,0.10)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(272.4deg, #4B6898 2.51%, #9E074A 93.94%)',
        'profile-gradient': 'linear-gradient(115deg, #C2185B 0%, #6A2C9E 100%)',
        'search-gradient': 'linear-gradient(120deg, #8B5CF6 0%, #7E57C2 60%, #A78BDA 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
