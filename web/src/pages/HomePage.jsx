import { motion } from 'framer-motion';
import { Cpu, Smartphone, Blocks } from 'lucide-react';

const GlassPrismHero = () => {
    return (
        <div className="relative h-[600px] w-full flex items-center justify-center bg-[#F0F2F5] rounded-3xl overflow-hidden border border-white">
            {/* Background Grid */}
            <div
                className="absolute inset-0"
                style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }}
            ></div>

            <div className="relative z-10 flex items-center gap-12 scale-90 md:scale-100">
                {/* 1. Raw Input (Blurred Paper) */}
                <motion.div
                    animate={{ x: [0, 150, 300], opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-0"
                >
                    <div className="w-24 h-32 bg-white rounded shadow-sm border border-gray-200 p-2 flex flex-col gap-2 blur-[2px] opacity-70">
                        <div className="h-2 w-16 bg-gray-200 rounded"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-12 w-full bg-gray-50 rounded mt-auto"></div>
                    </div>
                    <div className="mt-4 text-center text-xs font-mono text-gray-400">Raw Data</div>
                </motion.div>

                {/* 2. The Prism (RISC Zero) */}
                <div className="relative w-48 h-48 z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-blue-50/20 backdrop-blur-xl border border-white/60 rounded-[30px] shadow-prism transform rotate-45 flex items-center justify-center">
                        <div className="transform -rotate-45 text-accent opacity-50">
                            <Cpu size={48} strokeWidth={1} />
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-white/30 rounded-[30px] rotate-45 animate-pulse mix-blend-overlay"></div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-mono text-xs text-accent font-medium tracking-wider bg-white px-2 py-1 rounded shadow-sm">
                        ZK_CIRCUIT
                    </div>
                </div>

                {/* 3. Output (Gold Coin) */}
                <motion.div
                    animate={{ x: [-100, 100], opacity: [0, 0, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.6, 0.8, 1] }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-0"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                        <div className="w-12 h-12 border-2 border-yellow-100/50 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            GL
                        </div>
                    </div>
                    <div className="mt-4 text-center text-xs font-mono text-gray-800 font-bold">Proof Asset</div>
                </motion.div>
            </div>
        </div>
    );
};

export const HomePage = () => {
    return (
        <div className="space-y-24 pb-20">
            {/* Hero Section */}
            <section className="pt-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-text-muted shadow-sm"
                    >
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                        Now Live on Mainnet
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-text"
                    >
                        Prove it's you, <br />
                        <span className="text-text-muted">without revealing who you are.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-text-muted max-w-md leading-relaxed"
                    >
                        GhostLink turns your GitHub, PayPal, and Uber history into on-chain reputation badges.
                        <span className="text-text font-medium"> Private. Verifiable. Built on RISC Zero.</span>
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-4"
                    >
                        <button className="px-8 py-4 bg-text text-white rounded-xl font-medium hover:bg-black/80 transition-all shadow-lg shadow-black/10">
                            Connect Wallet
                        </button>
                        <button className="px-8 py-4 bg-white border border-gray-200 text-text rounded-xl font-medium hover:bg-gray-50 transition-all">
                            View Demo
                        </button>
                    </motion.div>
                </div>

                <div className="relative">
                    <GlassPrismHero />
                </div>
            </section>

            {/* Architecture Section */}
            <section className="px-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 100%' }}
                    ></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center space-y-4 group">
                            <div className="w-20 h-20 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500">
                                <Smartphone size={32} className="text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="font-semibold text-lg">User Local</h3>
                            <p className="text-sm text-text-muted">Data stays on your device.<br />TLS encryption intact.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center space-y-4 group">
                            <div className="w-20 h-20 bg-white border border-blue-100 shadow-prism rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-50/50"></div>
                                <Cpu size={32} className="text-accent relative z-10" />
                            </div>
                            <h3 className="font-semibold text-lg text-accent">ZK Processor</h3>
                            <p className="text-sm text-text-muted">Mathematical Proof generated<br />in isolated environment.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center space-y-4 group">
                            <div className="w-20 h-20 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500">
                                <Blocks size={32} className="text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="font-semibold text-lg">Blockchain</h3>
                            <p className="text-sm text-text-muted">Public Verification.<br />Smart Contract composability.</p>
                        </div>
                    </div>

                    {/* Connecting Line */}
                    <div className="absolute top-[35%] left-[16%] right-[16%] h-[2px] bg-gray-100 -z-10 hidden md:block">
                        <motion.div
                            animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-20 h-full bg-gradient-to-r from-transparent via-accent to-transparent"
                        />
                    </div>
                </div>
            </section>

            {/* Trust Battery */}
            <section className="text-center pb-20">
                <p className="text-sm font-semibold tracking-wide text-text-muted uppercase mb-8">Trusted Infrastructure</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-xl font-bold font-mono">RISC ZERO</span>
                    <span className="text-xl font-bold font-mono">ETHEREAL</span>
                    <span className="text-xl font-bold font-mono">TLSNotary</span>
                    <span className="text-xl font-bold font-mono">StarkWare</span>
                </div>
            </section>
        </div>
    );
};
