/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
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
                // Semantic Theme Tokens
                'surface': {
                    base: 'var(--surface-base)',
                    1: 'var(--surface-elevated-1)',
                    2: 'var(--surface-elevated-2)',
                    3: 'var(--surface-elevated-3)',
                },
                'theme-text': {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                    dim: 'var(--text-dim)',
                },
                'theme-accent': {
                    primary: 'var(--accent-primary)',
                    secondary: 'var(--accent-secondary)',
                },
                'theme-border': {
                    subtle: 'var(--border-subtle)',
                    medium: 'var(--border-medium)',
                    strong: 'var(--border-strong)',
                },
                // Legacy Neon Colors
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
            boxShadow: {
                'theme-glow': 'var(--shadow-glow)',
                'theme-strong': 'var(--shadow-strong)',
            },
        },
    },
    plugins: [],
}
