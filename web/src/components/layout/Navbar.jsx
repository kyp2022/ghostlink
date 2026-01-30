import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Zap, Ghost } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, account, onConnectWallet }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-2xl 
                              shadow-lg px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setActiveTab('home')}
                        >
                            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl 
                                          flex items-center justify-center transition-all group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                                <Ghost className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="font-bold text-lg text-white tracking-wide font-display">
                                GHOST<span className="text-cyan-400">LINK</span>
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
                                            ? 'text-cyan-400 bg-cyan-950/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Connect Wallet / Account */}
                        <div className="hidden md:block">
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
                                             bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10
                                             text-white rounded-xl text-sm font-semibold
                                             transition-all cursor-pointer group"
                                >
                                    <Zap size={16} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                    <span>Connect Wallet</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                            className="md:hidden mt-4 pt-4 border-t border-white/5"
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
                                                ? 'bg-cyan-500/10 text-cyan-400'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {/* Mobile Connect */}
                                <div className="pt-2 mt-2 border-t border-white/5">
                                    {account ? (
                                        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 
                                                      rounded-lg text-sm font-mono text-emerald-400 text-center">
                                            {formatAddress(account)}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                onConnectWallet();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                                     bg-white/5 border border-white/10
                                                     text-white rounded-lg text-sm font-semibold font-medium
                                                     cursor-pointer"
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
