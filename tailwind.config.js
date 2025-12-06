/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', 'sans-serif'],
                display: ['Fredoka', 'sans-serif'],
                serif: ['"Noto Serif JP"', 'serif'],
            },
            colors: {
                // Modern Culinary Palette
                primary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316', // Orange/Carrot
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                secondary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e', // Basil Green
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                accent: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e', // Berry Red
                    600: '#e11d48',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                },
                // Japanese Theme Colors (Legacy Support & New)
                jp: {
                    50: '#fdfbf7', // Rice Paper
                    100: '#f4f1ea',
                    200: '#e2dccc',
                    300: '#c5bfa8',
                    400: '#a8a085',
                    500: '#8c8468',
                    600: '#6f6850',
                    700: '#554f3d',
                    800: '#3e392e', // Dark Wood
                    900: '#2b261f',
                    indigo: '#3730a3',
                    sakura: '#fbcfe8',
                    matcha: '#65a30d',
                },
                // Legacy Chef Colors (mapped to primary)
                chef: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                }
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
                'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
                'float': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
            },
            animation: {
                'boil': 'boil 2s infinite ease-in-out',
                'float-bob': 'floatBob 3s infinite ease-in-out',
                'sizzle': 'sizzle 0.08s infinite linear',
                'chop': 'chop 0.3s ease-in-out',
                'knife-cut': 'knifeCut 0.2s ease-in-out',
                'shake': 'shake 0.5s ease-in-out',
                'float': 'float 3s ease-in-out infinite',
                'steam': 'steam 2s ease-out infinite',
                'bubble-rise': 'bubbleRise 2s ease-in infinite',
                'oil-pop': 'oilPop 0.3s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
                'whirl': 'whirl 1s linear infinite',
                'rise-slow': 'riseSlow 3s ease-out forwards',
                'wave-slow': 'waveSlow 4s ease-in-out infinite',
                'twinkle': 'twinkle 2s ease-in-out infinite',
            },
            keyframes: {
                boil: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
                    '25%': { transform: 'translateY(-2px) rotate(-2deg) scale(1.02)' },
                    '50%': { transform: 'translateY(0) rotate(2deg) scale(0.98)' },
                    '75%': { transform: 'translateY(-1px) rotate(-1deg) scale(1.01)' },
                },
                floatBob: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                sizzle: {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '25%': { transform: 'translate(1px, 1px) scale(1.05)' },
                    '50%': { transform: 'translate(-1px, -1px) scale(0.95)' },
                    '75%': { transform: 'translate(-1px, 1px) scale(1.02)' },
                    '100%': { transform: 'translate(0, 0) scale(1)' },
                },
                chop: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(0.9) rotate(-5deg)' },
                    '100%': { transform: 'scale(1)' },
                },
                knifeCut: {
                    '0%': { transform: 'rotate(0deg) translateY(0)' },
                    '25%': { transform: 'rotate(-15deg) translateY(-10px)' },
                    '50%': { transform: 'rotate(5deg) translateY(5px)' },
                    '100%': { transform: 'rotate(0deg) translateY(0)' },
                },
                shake: {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(-10deg)' },
                    '75%': { transform: 'rotate(10deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                steam: {
                    '0%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
                    '100%': { transform: 'translateY(-20px) scale(1.5)', opacity: '0' },
                },
                bubbleRise: {
                    '0%': { transform: 'translateY(100%) scale(0.5)', opacity: '0' },
                    '50%': { opacity: '1' },
                    '100%': { transform: 'translateY(-20%) scale(1.2)', opacity: '0' },
                },
                oilPop: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '0' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
                },
                whirl: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                riseSlow: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                waveSlow: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(10px)' },
                },
                twinkle: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.5', transform: 'scale(0.8)' },
                },
            },
            screens: {
                'xs': '400px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
    },
    plugins: [],
}
