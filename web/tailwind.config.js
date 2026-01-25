/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    DEFAULT: '#F5F5F7',
                    surface: '#FFFFFF',
                },
                text: {
                    DEFAULT: '#111111',
                    muted: '#6B7280',
                },
                accent: {
                    DEFAULT: '#3B82F6',
                    dark: '#2563EB',
                },
                border: {
                    DEFAULT: '#E5E7EB',
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
                'prism': '0 20px 40px -10px rgba(59, 130, 246, 0.3)',
            }
        },
    },
    plugins: [],
}
