import { motion } from 'framer-motion';
import { Cpu, Smartphone, Blocks, Zap, Shield, Lock } from 'lucide-react';

// Scroll Reveal Component with De-pixelation effect
const Reveal = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

// Animated geometric prism for hero section
const ZKPrismHero = () => {
    return (
        <div className="relative h-[600px] w-full flex items-center justify-center 
                      bg-gradient-to-br from-surface-1 via-surface-base to-surface-1 
                      rounded-3xl overflow-hidden 
                      border border-theme-accent-primary/20 
                      shadow-theme-strong">
            {/* Animated grid background - Theme Aware */}
            <div
                className="absolute inset-0 opacity-20 dark:opacity-20 opacity-5"
                style={{
                    backgroundImage: `
                        linear-gradient(var(--accent-primary) 1px, transparent 1px),
                        linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Scanning Laser Effect - Dark Mode Only */}
            <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 z-20 hidden dark:block"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
            />

            {/* Light Mode Scanner - Subtle Line */}
            <motion.div
                className="absolute inset-x-0 h-px bg-theme-accent-primary/20 z-20 dark:hidden"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent z-10 pointer-events-none dark:block hidden"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Glowing orbs - Dark Mode Only */}
            <motion.div
                className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl dark:block hidden"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl dark:block hidden"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="relative z-10 flex items-center gap-12 scale-90 md:scale-100">
                {/* Input data particle */}
                <motion.div
                    animate={{ x: [0, 150, 300], opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-0"
                >
                    <div className="w-20 h-28 bg-surface-1 rounded-lg border border-theme-border-medium p-3 backdrop-blur-sm shadow-theme-strong">
                        <div className="h-1.5 w-12 bg-theme-accent-primary/50 rounded mb-2" />
                        <div className="h-1.5 w-full bg-theme-border-medium rounded mb-1.5" />
                        <div className="h-1.5 w-full bg-theme-border-medium rounded mb-1.5" />
                        <div className="h-8 w-full bg-theme-border-subtle rounded mt-auto" />
                    </div>
                    <div className="mt-3 text-center text-xs font-mono text-theme-accent-primary/70">RAW_DATA</div>
                </motion.div>

                {/* The ZK Prism */}
                <div className="relative w-48 h-48 z-10">
                    {/* Outer glow - Dark Mode */}
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-[30px] blur-xl dark:block hidden" />

                    {/* Prism container */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 
                                      bg-surface-elevated-1/80
                                      dark:bg-gradient-to-br dark:from-slate-800/80 dark:via-cyan-900/20 dark:to-purple-900/20 
                                      backdrop-blur-xl 
                                      border border-theme-border-strong 
                                      dark:border-cyan-500/30 
                                      rounded-[30px] 
                                      shadow-theme-strong
                                      dark:shadow-[0_0_40px_rgba(0,255,255,0.2),inset_0_0_60px_rgba(0,255,255,0.05)]
                                      transform rotate-45" />
                    </motion.div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Cpu size={48} strokeWidth={1} className="text-theme-accent-primary dark:text-cyan-400 dark:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                        </motion.div>
                    </div>

                    {/* Label */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                                  font-mono text-xs text-theme-accent-primary dark:text-cyan-400 font-medium tracking-wider 
                                  bg-surface-1/90 px-4 py-2 rounded-lg border border-theme-border-medium
                                  shadow-theme-glow">
                        ZK_CIRCUIT
                    </div>
                </div>

                {/* Output token */}
                <motion.div
                    animate={{ x: [-100, 100], opacity: [0, 0, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.6, 0.8, 1] }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-0"
                >
                    <div className="w-20 h-20 bg-surface-1 dark:bg-gradient-to-br dark:from-emerald-400 dark:to-cyan-500 rounded-xl 
                                  shadow-theme-strong dark:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center 
                                  border-2 border-theme-accent-secondary dark:border-emerald-300/50">
                        <Shield size={32} className="text-theme-text-primary drop-shadow-lg" />
                    </div>
                    <div className="mt-3 text-center text-xs font-mono text-theme-accent-secondary dark:text-emerald-400 font-bold">ZK_PROOF</div>
                </motion.div>
            </div>
        </div>
    );
};

export const HomePage = ({ onConnectWallet, onViewDemo }) => {
    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <section className="pt-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    {/* Status badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 
                                 bg-surface-2/50 border border-theme-border-medium rounded-full 
                                 text-xs font-mono text-theme-accent-primary 
                                 shadow-theme-glow"
                    >
                        <span className="w-2 h-2 bg-theme-accent-secondary dark:bg-emerald-400 rounded-full animate-pulse shadow-theme-glow" />
                        NETWORK::LIVE_ON_SEPOLIA
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-theme-text-primary"
                    >
                        <span>Prove it's you,</span>
                        <br />
                        <span className="text-theme-accent-primary dark:bg-gradient-to-r dark:from-cyan-400 dark:via-purple-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent
                                       dark:bg-[length:200%_auto] dark:animate-[shine_3s_linear_infinite]">
                            without revealing who you are.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-theme-text-secondary max-w-md leading-relaxed font-light"
                    >
                        GhostLink transforms your <span className="text-theme-accent-primary font-semibold">GitHub</span>,
                        <span className="text-theme-accent-primary font-semibold"> Alipay</span>, and <span className="text-theme-accent-primary font-semibold">wallet history</span> into
                        verifiable on-chain credentials.
                        <span className="block mt-2 text-theme-text-primary font-medium">
                            Private. Verifiable. Built on RISC Zero.
                        </span>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-4"
                    >
                        <button
                            onClick={onConnectWallet}
                            className="group px-8 py-4 bg-theme-accent-primary
                                     dark:bg-gradient-to-r dark:from-cyan-500 dark:to-purple-500 
                                     text-white dark:text-theme-text-primary rounded-xl font-medium 
                                     shadow-theme-strong dark:shadow-[0_0_30px_rgba(0,255,255,0.3)]
                                     hover:shadow-lg dark:hover:shadow-[0_0_50px_rgba(0,255,255,0.5)]
                                     transition-all duration-300 cursor-pointer
                                     flex items-center gap-2"
                        >
                            <Zap size={18} className="group-hover:animate-pulse" />
                            Connect Wallet
                        </button>
                        <button
                            onClick={onViewDemo}
                            className="px-8 py-4 bg-surface-1 border border-theme-border-strong 
                                     text-theme-accent-primary rounded-xl font-medium 
                                     hover:bg-surface-2
                                     shadow-theme-glow
                                     transition-all duration-300 cursor-pointer"
                        >
                            View Demo →
                        </button>
                    </motion.div>
                </div>

                {/* Hero Visual */}
                <div className="relative">
                    <ZKPrismHero />
                </div>
            </section>

            {/* Architecture Section */}
            <section className="px-6 max-w-7xl mx-auto mt-32">
                <Reveal delay={0.2}>
                    <div className="bg-surface-1/50 rounded-3xl p-16 border border-theme-border-subtle 
                                  shadow-theme-strong relative overflow-hidden">

                        {/* Grid pattern - Theme Aware */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-5"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)',
                                backgroundSize: '60px 100%'
                            }}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {/* Step 1 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-surface-elevated-1 dark:bg-slate-800 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-theme-border-medium dark:border-slate-700 
                                              shadow-theme-glow
                                              group-hover:border-theme-accent-primary/50 group-hover:shadow-theme-strong
                                              transition-all duration-300">
                                    <Smartphone size={32} className="text-theme-text-muted group-hover:text-theme-accent-primary transition-colors" />
                                </div>
                                <h3 className="font-semibold text-lg text-theme-text-primary font-mono">USER_LOCAL</h3>
                                <p className="text-sm text-theme-text-muted">
                                    Data stays on your device.<br />TLS encryption intact.
                                </p>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-surface-elevated-1 dark:bg-gradient-to-br dark:from-cyan-900/50 dark:to-purple-900/50 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-theme-accent-primary/30 
                                              shadow-theme-glow
                                              group-hover:shadow-theme-strong
                                              transition-all duration-300">
                                    <Cpu size={32} className="text-theme-accent-primary dark:text-cyan-400" />
                                </div>
                                <h3 className="font-semibold text-lg text-theme-accent-primary dark:text-cyan-400 font-mono">ZK_PROCESSOR</h3>
                                <p className="text-sm text-theme-text-muted">
                                    Mathematical proof generated<br />in isolated RISC Zero environment.
                                </p>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-surface-elevated-1 dark:bg-slate-800 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-theme-border-medium dark:border-slate-700 
                                              shadow-theme-glow
                                              group-hover:border-theme-accent-secondary/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]
                                              transition-all duration-300">
                                    <Blocks size={32} className="text-theme-text-muted group-hover:text-theme-accent-secondary transition-colors" />
                                </div>
                                <h3 className="font-semibold text-lg text-theme-text-primary font-mono">BLOCKCHAIN</h3>
                                <p className="text-sm text-theme-text-muted">
                                    Public verification.<br />Smart contract composability.
                                </p>
                            </motion.div>
                        </div>

                        {/* Connecting line */}
                        <div className="absolute top-[35%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-theme-accent-primary/30 to-transparent hidden md:block">
                            <motion.div
                                animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="w-20 h-full bg-gradient-to-r from-transparent via-theme-accent-primary dark:via-cyan-400 to-transparent"
                            />
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Trust Section */}
            <section className="text-center py-32">
                <Reveal delay={0.4}>
                    <p className="text-sm font-mono tracking-widest text-theme-text-muted mb-8">TRUSTED_INFRASTRUCTURE</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 hover:opacity-80 transition-opacity duration-500">
                        <span className="text-xl font-bold font-mono text-theme-text-secondary dark:text-cyan-400">RISC_ZERO</span>
                        <span className="text-xl font-bold font-mono text-theme-text-secondary dark:text-purple-400">ETHEREUM</span>
                        <span className="text-xl font-bold font-mono text-theme-text-secondary dark:text-emerald-400">TLS_NOTARY</span>
                        <span className="text-xl font-bold font-mono text-theme-text-secondary dark:text-cyan-400">STARKWARE</span>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};

export default HomePage;
