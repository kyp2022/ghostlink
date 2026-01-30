import { Github, Twitter, Globe, Terminal, Code, Zap, Package, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const DevelopersPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6
                                 bg-slate-800/50 border border-purple-500/30 rounded-full 
                                 text-xs font-mono text-purple-400"
                    >
                        <Terminal size={14} />
                        DEVELOPERS::SDK
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Import. Verify. <span className="hologram-text">Mint.</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
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
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Zap className="text-cyan-400" size={24} />
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
                                    className="flex items-start gap-4 p-5 bg-slate-800/50 rounded-xl 
                                             border border-slate-700/50 hover:border-cyan-500/30 
                                             transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                                                  rounded-xl flex items-center justify-center border border-cyan-500/30
                                                  text-cyan-400 font-mono font-bold
                                                  group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
                                        {step}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white mb-1">{title}</div>
                                        <div className="text-sm text-slate-500">{desc}</div>
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
                        className="bg-slate-900/80 rounded-2xl border border-cyan-500/20 overflow-hidden
                                 shadow-[0_0_40px_rgba(0,255,255,0.1)]"
                    >
                        {/* Editor Header */}
                        <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                            </div>
                            <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                <Code size={12} />
                                main.rs
                            </span>
                        </div>

                        {/* Code Content */}
                        <div className="p-6 overflow-x-auto font-mono text-sm leading-relaxed">
                            <div><span className="text-purple-400">use</span> <span className="text-cyan-300">ghostlink_sdk</span>::prelude::*;</div>
                            <br />
                            <div><span className="text-purple-400">fn</span> <span className="text-yellow-300">main</span>() {'{'}</div>
                            <div className="pl-4 text-slate-500">// Read data from host</div>
                            <div className="pl-4"><span className="text-purple-400">let</span> input: <span className="text-cyan-300">String</span> = env::<span className="text-yellow-300">read</span>();</div>
                            <br />
                            <div className="pl-4 text-slate-500">// Verify JSON structure</div>
                            <div className="pl-4">
                                <span className="text-purple-400">let</span> data: <span className="text-cyan-300">AlipayData</span> =
                                <span className="text-white"> serde_json</span>::<span className="text-yellow-300">from_str</span>(&input).unwrap();
                            </div>
                            <br />
                            <div className="pl-4"><span className="text-purple-400">if</span> data.balance {'>'} <span className="text-emerald-400">10000.0</span> {'{'}</div>
                            <div className="pl-8">env::<span className="text-yellow-300">commit</span>(<span className="text-emerald-400">"SOLVENT"</span>);</div>
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
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Package className="text-purple-400" size={24} />
                            Parser Marketplace
                        </h3>
                        <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
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
                                className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 
                                         flex flex-col items-center gap-4 
                                         hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]
                                         transition-all cursor-pointer group"
                            >
                                <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center
                                              group-hover:bg-cyan-500/10 transition-all">
                                    <item.icon size={28} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <span className="font-semibold text-white">{item.name}</span>
                                <span className={`text-xs px-3 py-1 rounded-full font-mono font-medium
                                               ${item.color === 'emerald'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
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
