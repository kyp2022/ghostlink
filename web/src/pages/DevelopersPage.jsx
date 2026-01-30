import { Github, Twitter, Globe, Terminal, Code, Zap, Package, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const DevelopersPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-surface-base via-surface-1 to-surface-base pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6
                                 bg-surface-2/50 border border-theme-border-medium rounded-full 
                                 text-xs font-mono text-theme-accent-secondary"
                    >
                        <Terminal size={14} />
                        DEVELOPERS::SDK
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-theme-text-primary">
                        Import. Verify. <span className="text-theme-accent-secondary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-purple-400">Mint.</span>
                    </h1>
                    <p className="text-theme-text-secondary text-lg">
                        Use our Rust SDK to build custom data parsers. Define verification logic in standard Rust.
                    </p>
                </div>

                {/* Integration Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-24">
                    {/* Steps */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:sticky lg:top-32"
                    >
                        <h2 className="text-2xl font-bold text-theme-text-primary mb-6 flex items-center gap-3">
                            <Zap className="text-theme-accent-primary" size={24} />
                            Quick Start
                        </h2>
                        <div className="flex flex-col gap-4">
                            {[
                                { step: 1, title: 'Install Rust SDK', desc: 'cargo add ghostlink-sdk' },
                                { step: 2, title: 'Write Parser Logic', desc: 'Define your data verification rules' },
                                { step: 3, title: 'Deploy to Network', desc: 'We handle ZK circuit compilation' }
                            ].map(({ step, title, desc }) => (
                                <div
                                    key={step}
                                    className="flex items-start gap-4 p-5 bg-surface-elevated-1 rounded-xl 
                                             border border-theme-border-medium hover:border-theme-accent-primary/30 
                                             shadow-theme-glow hover:shadow-theme-strong
                                             transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 bg-theme-accent-primary/10 
                                                  rounded-xl flex items-center justify-center border border-theme-accent-primary/30
                                                  text-theme-accent-primary font-mono font-bold
                                                  group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
                                        {step}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-theme-text-primary mb-1">{title}</div>
                                        <div className="text-sm text-theme-text-muted">{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Code Editor */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface-elevated-2 rounded-2xl border border-theme-border-medium overflow-hidden
                                 shadow-theme-strong"
                    >
                        {/* Editor Header */}
                        <div className="bg-surface-elevated-3 border-b border-theme-border-medium px-4 py-3 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                            </div>
                            <span className="text-xs text-theme-text-muted font-mono flex items-center gap-2">
                                <Code size={12} />
                                main.rs
                            </span>
                        </div>

                        {/* Code Content */}
                        <div className="p-6 overflow-x-auto font-mono text-sm leading-relaxed text-theme-text-primary">
                            <div><span className="text-purple-400">use</span> <span className="text-cyan-300 dark:text-cyan-400">ghostlink_sdk</span>::prelude::*;</div>
                            <br />
                            <div><span className="text-purple-400">fn</span> <span className="text-yellow-600 dark:text-yellow-300">main</span>() {'{'}</div>
                            <div className="pl-4 text-theme-text-muted">// Read data from host</div>
                            <div className="pl-4"><span className="text-purple-400">let</span> input: <span className="text-cyan-300 dark:text-cyan-400">String</span> = env::<span className="text-yellow-600 dark:text-yellow-300">read</span>();</div>
                            <br />
                            <div className="pl-4 text-theme-text-muted">// Verify JSON structure</div>
                            <div className="pl-4">
                                <span className="text-purple-400">let</span> data: <span className="text-cyan-300 dark:text-cyan-400">AlipayData</span> =
                                <span className="text-theme-text-primary"> serde_json</span>::<span className="text-yellow-600 dark:text-yellow-300">from_str</span>(&input).unwrap();
                            </div>
                            <br />
                            <div className="pl-4"><span className="text-purple-400">if</span> data.balance {'>'} <span className="text-emerald-500 dark:text-emerald-400">10000.0</span> {'{'}</div>
                            <div className="pl-8">env::<span className="text-yellow-600 dark:text-yellow-300">commit</span>(<span className="text-emerald-500 dark:text-emerald-400">"SOLVENT"</span>);</div>
                            <div className="pl-4">{'}'}</div>
                            <div>{'}'}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Parser Marketplace */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-theme-text-primary flex items-center gap-3">
                            <Package className="text-theme-accent-secondary" size={24} />
                            Parser Marketplace
                        </h3>
                        <a href="#" className="text-sm text-theme-accent-primary hover:text-theme-accent-secondary flex items-center gap-1 font-medium">
                            View All <ExternalLink size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'GitHub', status: 'LIVE', icon: Github, color: 'emerald' },
                            { name: 'Twitter', status: 'LIVE', icon: Twitter, color: 'emerald' },
                            { name: 'Alipay', status: 'BETA', icon: Globe, color: 'yellow' },
                            { name: 'Steam', status: 'LIVE', icon: Globe, color: 'emerald' },
                        ].map((item) => (
                            <div
                                key={item.name}
                                className="bg-surface-elevated-1 p-6 rounded-xl border border-theme-border-medium 
                                         flex flex-col items-center gap-4 
                                         hover:border-theme-accent-primary/30 hover:shadow-theme-glow
                                         transition-all cursor-pointer group"
                            >
                                <div className="w-14 h-14 bg-surface-2 rounded-full flex items-center justify-center
                                              group-hover:bg-theme-accent-primary/10 transition-all">
                                    <item.icon size={28} className="text-theme-text-muted group-hover:text-theme-accent-primary transition-colors" />
                                </div>
                                <span className="font-semibold text-theme-text-primary">{item.name}</span>
                                <span className={`text-xs px-3 py-1 rounded-full font-mono font-medium
                                               ${item.color === 'emerald'
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                        : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
