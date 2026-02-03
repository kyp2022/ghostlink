import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Zap, Ghost, Sun, Moon, LogOut, FileCode2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import LanguageToggle from '../ui/LanguageToggle';

export const Navbar = ({ activeTab, setActiveTab, account, onConnectWallet, disconnectWallet, isConnecting }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { t } = useI18n();

    const navItems = [
        { key: 'home', label: t('nav.home') },
        { key: 'solutions', label: t('nav.solutions') },
        { key: 'explorer', label: t('nav.explorer') },
        { key: 'contractInspector', label: t('nav.contracts') },
        { key: 'developers', label: t('nav.developers') },
        { key: 'company', label: t('nav.company') }
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
                            <LanguageToggle
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-1 border border-theme-border-medium 
                                         hover:bg-surface-2 hover:border-theme-accent-primary/30
                                         transition-all cursor-pointer text-sm font-semibold text-theme-text-primary"
                            />
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-lg bg-surface-1 border border-theme-border-medium 
                                         hover:bg-surface-2 hover:border-theme-accent-primary/30
                                         transition-all cursor-pointer group"
                                aria-label={t('theme.toggle')}
                                title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
                            >
                                {theme === 'dark' ? (
                                    <Sun size={18} className="text-theme-accent-primary group-hover:rotate-45 transition-transform duration-300" />
                                ) : (
                                    <Moon size={18} className="text-theme-accent-primary group-hover:-rotate-12 transition-transform duration-300" />
                                )}
                            </button>

                            {/* Wallet */}
                            {account ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 
                                                  rounded-xl text-sm text-emerald-400 font-mono">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        {formatAddress(account)}
                                    </div>
                                    <button
                                        onClick={() => disconnectWallet?.()}
                                        className="p-2.5 rounded-lg bg-surface-1 border border-theme-border-medium
                                                 hover:bg-surface-2 hover:border-theme-accent-primary/30
                                                 transition-all cursor-pointer group"
                                        aria-label={t('wallet.disconnect')}
                                        title={t('wallet.disconnect')}
                                    >
                                        <LogOut size={16} className="text-theme-text-muted group-hover:text-theme-accent-primary transition-colors" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onConnectWallet}
                                    disabled={isConnecting}
                                    className="flex items-center gap-2 px-5 py-2.5 
                                             bg-surface-1 border border-theme-border-medium 
                                             hover:border-theme-accent-primary/30 hover:bg-theme-accent-primary/10
                                             text-theme-text-primary rounded-xl text-sm font-semibold
                                             transition-all cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Zap size={16} className="text-theme-text-muted group-hover:text-theme-accent-primary transition-colors" />
                                    <span>{isConnecting ? t('wallet.connecting') : t('wallet.connect')}</span>
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
                                    <LanguageToggle
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                                 bg-surface-2 border border-theme-border-medium
                                                 text-theme-text-primary rounded-lg text-sm font-semibold
                                                 cursor-pointer hover:border-theme-accent-primary/30"
                                    />
                                    {account ? (
                                        <div className="space-y-2">
                                            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 
                                                          rounded-lg text-sm font-mono text-emerald-500 dark:text-emerald-400 text-center">
                                                {formatAddress(account)}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    disconnectWallet?.();
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                                         bg-surface-2 border border-theme-border-medium
                                                         text-theme-text-primary rounded-lg text-sm font-semibold
                                                         cursor-pointer hover:border-theme-accent-primary/30"
                                            >
                                                <LogOut size={16} />
                                                {t('wallet.disconnect')}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                onConnectWallet();
                                                setMobileMenuOpen(false);
                                            }}
                                            disabled={isConnecting}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                                     bg-surface-2 border border-theme-border-medium
                                                     text-theme-text-primary rounded-lg text-sm font-semibold font-medium
                                                     cursor-pointer hover:border-theme-accent-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Zap size={16} />
                                            {isConnecting ? t('wallet.connecting') : t('wallet.connect')}
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
