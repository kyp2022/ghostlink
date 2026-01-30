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
        <div className="relative h-[600px] w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl overflow-hidden border border-cyan-500/20">
            {/* Animated grid background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Scanning Laser Effect */}
            <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 z-20"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
            />
            <motion.div
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent z-10 pointer-events-none"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Glowing orbs */}
            <motion.div
                className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
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
                    <div className="w-20 h-28 bg-slate-800/80 rounded-lg border border-slate-600 p-3 backdrop-blur-sm">
                        <div className="h-1.5 w-12 bg-cyan-500/50 rounded mb-2" />
                        <div className="h-1.5 w-full bg-slate-600 rounded mb-1.5" />
                        <div className="h-1.5 w-full bg-slate-600 rounded mb-1.5" />
                        <div className="h-8 w-full bg-slate-700/50 rounded mt-auto" />
                    </div>
                    <div className="mt-3 text-center text-xs font-mono text-cyan-400/70">RAW_DATA</div>
                </motion.div>

                {/* The ZK Prism */}
                <div className="relative w-48 h-48 z-10">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-[30px] blur-xl" />

                    {/* Prism container */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-cyan-900/20 to-purple-900/20 
                                      backdrop-blur-xl border border-cyan-500/30 rounded-[30px] 
                                      shadow-[0_0_40px_rgba(0,255,255,0.2),inset_0_0_60px_rgba(0,255,255,0.05)]
                                      transform rotate-45" />
                    </motion.div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Cpu size={48} strokeWidth={1} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                        </motion.div>
                    </div>

                    {/* Label */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                                  font-mono text-xs text-cyan-400 font-medium tracking-wider 
                                  bg-slate-900/90 px-4 py-2 rounded-lg border border-cyan-500/30
                                  shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                        ZK_CIRCUIT
                    </div>
                </div>

                {/* Output token */}
                <motion.div
                    animate={{ x: [-100, 100], opacity: [0, 0, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.6, 0.8, 1] }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-0"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl 
                                  shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center 
                                  border-2 border-emerald-300/50">
                        <Shield size={32} className="text-white drop-shadow-lg" />
                    </div>
                    <div className="mt-3 text-center text-xs font-mono text-emerald-400 font-bold">ZK_PROOF</div>
                </motion.div>
            </div>
        </div>
    );
};

export const HomePage = ({ onConnectWallet, onViewDemo }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Hero Section */}
            <section className="pt-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    {/* Status badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 
                                 bg-slate-800/50 border border-cyan-500/30 rounded-full 
                                 text-xs font-mono text-cyan-400 
                                 shadow-[0_0_20px_rgba(0,255,255,0.1)]"
                    >
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        NETWORK::LIVE_ON_SEPOLIA
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
                    >
                        <span className="text-white">Prove it's you,</span>
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent
                                       bg-[length:200%_auto] animate-[shine_3s_linear_infinite]">
                            without revealing who you are.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-md leading-relaxed font-light"
                    >
                        GhostLink transforms your <span className="text-cyan-400">GitHub</span>,
                        <span className="text-cyan-400"> Alipay</span>, and <span className="text-cyan-400">wallet history</span> into
                        verifiable on-chain credentials.
                        <span className="block mt-2 text-white font-medium">
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
                            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 
                                     text-white rounded-xl font-medium 
                                     shadow-[0_0_30px_rgba(0,255,255,0.3)]
                                     hover:shadow-[0_0_50px_rgba(0,255,255,0.5)]
                                     transition-all duration-300 cursor-pointer
                                     flex items-center gap-2"
                        >
                            <Zap size={18} className="group-hover:animate-pulse" />
                            Connect Wallet
                        </button>
                        <button
                            onClick={onViewDemo}
                            className="px-8 py-4 bg-slate-800/50 border border-cyan-500/30 
                                     text-cyan-400 rounded-xl font-medium 
                                     hover:bg-slate-800 hover:border-cyan-400/50
                                     hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]
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
                    <div className="bg-slate-900/50 rounded-3xl p-16 border border-cyan-500/10 
                                  shadow-[0_0_60px_rgba(0,255,255,0.05)] relative overflow-hidden">

                        {/* Grid pattern */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-5"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #00FFFF 1px, transparent 1px)',
                                backgroundSize: '60px 100%'
                            }}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {/* Step 1 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-slate-700 
                                              group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]
                                              transition-all duration-300">
                                    <Smartphone size={32} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <h3 className="font-semibold text-lg text-white font-mono">USER_LOCAL</h3>
                                <p className="text-sm text-slate-500">
                                    Data stays on your device.<br />TLS encryption intact.
                                </p>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-cyan-500/30 
                                              shadow-[0_0_30px_rgba(0,255,255,0.1)]
                                              group-hover:shadow-[0_0_40px_rgba(0,255,255,0.3)]
                                              transition-all duration-300">
                                    <Cpu size={32} className="text-cyan-400" />
                                </div>
                                <h3 className="font-semibold text-lg text-cyan-400 font-mono">ZK_PROCESSOR</h3>
                                <p className="text-sm text-slate-500">
                                    Mathematical proof generated<br />in isolated RISC Zero environment.
                                </p>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-slate-700 
                                              group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]
                                              transition-all duration-300">
                                    <Blocks size={32} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="font-semibold text-lg text-white font-mono">BLOCKCHAIN</h3>
                                <p className="text-sm text-slate-500">
                                    Public verification.<br />Smart contract composability.
                                </p>
                            </motion.div>
                        </div>

                        {/* Connecting line */}
                        <div className="absolute top-[35%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent hidden md:block">
                            <motion.div
                                animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="w-20 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            />
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Trust Section */}
            <section className="text-center py-32">
                <Reveal delay={0.4}>
                    <p className="text-sm font-mono tracking-widest text-slate-500 mb-8">TRUSTED_INFRASTRUCTURE</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 hover:opacity-80 transition-opacity duration-500">
                        <span className="text-xl font-bold font-mono text-cyan-400">RISC_ZERO</span>
                        <span className="text-xl font-bold font-mono text-purple-400">ETHEREUM</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">TLS_NOTARY</span>
                        <span className="text-xl font-bold font-mono text-cyan-400">STARKWARE</span>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};

export default HomePage;
