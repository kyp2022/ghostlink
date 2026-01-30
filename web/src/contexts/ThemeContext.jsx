import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { },
    isTransitioning: false,
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem('ghostlink-theme');
        if (stored && (stored === 'dark' || stored === 'light')) {
            setTheme(stored);
        } else {
            // Detect system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    // Toggle theme with transition animation
    const toggleTheme = () => {
        setIsTransitioning(true);

        // Start transition immediately
        setTimeout(() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);

            // End transition after animation completes
            setTimeout(() => {
                setIsTransitioning(false);
            }, 600);
        }, 300);
    };

    // Apply theme class to document root
    useEffect(() => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove('dark', 'light');

        // Add current theme class
        root.classList.add(theme);

        // Persist to localStorage
        localStorage.setItem('ghostlink-theme', theme);
    }, [theme]);

    const value = {
        theme,
        toggleTheme,
        isTransitioning,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
