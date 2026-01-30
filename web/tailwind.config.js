/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'mono': ['JetBrains Mono', 'monospace'],
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'display': ['JetBrains Mono', 'monospace'], // Per user request for headers
            },
            colors: {
                'neon-cyan': '#00FFFF',
                'neon-purple': '#A855F7',
                'neon-magenta': '#FF00FF',
                'neon-green': '#22C55E',
                'neon-blue': '#3B82F6',
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 1.5s infinite',
                'gradient-shift': 'gradient-shift 4s ease infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                        opacity: '1'
                    },
                    '50%': {
                        boxShadow: '0 0 40px rgba(0, 255, 255, 0.6)',
                        opacity: '0.8'
                    },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
        },
    },
    plugins: [],
}
