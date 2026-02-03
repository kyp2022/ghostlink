import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Zap, Sun, Moon, Home, Layers, Search, Code, Building2, ChevronLeft, ChevronRight, LogOut, FileCode2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import LanguageToggle from '../ui/LanguageToggle';

/**
 * SideNavbar - Persistent left-hand vertical sidebar for Light Mode
 * 
 * "Transparent Data Foundry" aesthetic:
 * - Physical paper/acrylic panel effect
 * - Sharp shadows showing stacking order
 * - Technical, structured navigation
 */
export const SideNavbar = ({ activeTab, setActiveTab, account, onConnectWallet, disconnectWallet, isConnecting }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { t } = useI18n();

    const navItems = [
        { key: 'home', label: t('nav.home'), icon: Home },
        { key: 'solutions', label: t('nav.solutions'), icon: Layers },
        { key: 'explorer', label: t('nav.explorer'), icon: Search },
        { key: 'contractInspector', label: t('nav.contracts'), icon: FileCode2 },
        { key: 'developers', label: t('nav.developers'), icon: Code },
        { key: 'company', label: t('nav.company'), icon: Building2 }
    ];

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <nav className={`
            h-full flex flex-col
            bg-white border-r border-slate-200
            shadow-physical-2 transition-all duration-300
            ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
        `}>
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-200">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setActiveTab('home')}
                >
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center
                                  shadow-physical-1 transition-transform group-hover:scale-105">
                        <Ghost className="w-5 h-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-lg text-slate-900 tracking-wide font-display"
                            >
                                GHOST<span className="text-amber-500">LINK</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                                text-sm font-medium transition-all cursor-pointer
                                ${isActive
                                    ? 'bg-slate-900 text-white shadow-physical-1'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={20} className={isActive ? 'text-amber-400' : ''} />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-mono tracking-wider"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Section (moved controls to the right header in Light Mode) */}
            <div className="p-3 border-t border-slate-200" />

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2
                          w-6 h-6 bg-white border border-slate-200 rounded-full
                          flex items-center justify-center shadow-physical-1
                          text-slate-400 hover:text-slate-600 cursor-pointer
                          transition-all hover:scale-110"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </nav>
    );
};

export default SideNavbar;
