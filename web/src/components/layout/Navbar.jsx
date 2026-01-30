import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Zap, Ghost, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const Navbar = ({ activeTab, setActiveTab, account, onConnectWallet }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { key: 'home', label: 'HOME' },
        { key: 'solutions', label: 'SOLUTIONS' },
        { key: 'explorer', label: 'EXPLORER' },
        { key: 'developers', label: 'DEVELOPERS' },
        { key: 'company', label: 'COMPANY' }
    ];

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <nav className="sticky top-0 z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-surface-base/80 backdrop-blur-xl border border-theme-border-medium rounded-2xl 
                              shadow-theme-glow px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setActiveTab('home')}
                        >
                            <div className="w-10 h-10 bg-theme-accent-primary/10 border border-theme-accent-primary/20 rounded-xl 
                                          flex items-center justify-center transition-all group-hover:border-theme-accent-primary/50 group-hover:shadow-theme-glow">
                                <Ghost className="w-5 h-5 text-theme-accent-primary" />
                            </div>
                            <span className="font-bold text-lg text-theme-text-primary tracking-wide font-display">
                                GHOST<span className="text-theme-accent-primary">LINK</span>
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer font-sans
                                              ${activeTab === item.key
                                            ? 'text-theme-accent-primary bg-theme-accent-primary/10'
                                            : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-surface-1'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Theme Toggle \u0026 Connect Wallet */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-lg bg-surface-1 border border-theme-border-medium 
                                         hover:bg-surface-2 hover:border-theme-accent-primary/30
                                         transition-all cursor-pointer group"
                                aria-label="Toggle theme"
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                {theme === 'dark' ? (
                                    <Sun size={18} className="text-theme-accent-primary group-hover:rotate-45 transition-transform duration-300" />
                                ) : (
                                    <Moon size={18} className="text-theme-accent-primary group-hover:-rotate-12 transition-transform duration-300" />
                                )}
                            </button>

                            {/* Wallet */}
                            {account ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 
                                              rounded-xl text-sm text-emerald-400 font-mono">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    {formatAddress(account)}
                                </div>
                            ) : (
                                <button
                                    onClick={onConnectWallet}
                                    className="flex items-center gap-2 px-5 py-2.5 
                                             bg-surface-1 border border-theme-border-medium 
                                             hover:border-theme-accent-primary/30 hover:bg-theme-accent-primary/10
                                             text-theme-text-primary rounded-xl text-sm font-semibold
                                             transition-all cursor-pointer group"
                                >
                                    <Zap size={16} className="text-theme-text-muted group-hover:text-theme-accent-primary transition-colors" />
                                    <span>Connect Wallet</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 pt-4 border-t border-theme-border-medium"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map(item => (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            setActiveTab(item.key);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all cursor-pointer
                                                  ${activeTab === item.key
                                                ? 'bg-theme-accent-primary/10 text-theme-accent-primary'
                                                : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-surface-2'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {/* Mobile Connect */}
                                <div className="pt-2 mt-2 border-t border-theme-border-medium">
                                    {account ? (
                                        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 
                                                      rounded-lg text-sm font-mono text-emerald-500 dark:text-emerald-400 text-center">
                                            {formatAddress(account)}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                onConnectWallet();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                                     bg-surface-2 border border-theme-border-medium
                                                     text-theme-text-primary rounded-lg text-sm font-semibold font-medium
                                                     cursor-pointer hover:border-theme-accent-primary/30"
                                        >
                                            <Zap size={16} />
                                            Connect Wallet
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
