import { Github, Twitter, ExternalLink } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-surface-1 border-t border-theme-border-medium py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl 
                                          flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.4)]">
                                <span className="text-white font-bold text-lg">G</span>
                            </div>
                            <span className="font-bold text-xl font-mono text-theme-text-primary tracking-wider">
                                GHOST<span className="text-cyan-400">LINK</span>
                            </span>
                        </div>
                        <p className="text-theme-text-muted text-sm max-w-md leading-relaxed mb-6">
                            Transform your Web2 data into verifiable on-chain credentials
                            using zero-knowledge proofs. Private. Verifiable. Built on RISC Zero.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/ghostlink"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-surface-2 border border-theme-border-medium rounded-lg 
                                         flex items-center justify-center text-theme-text-muted 
                                         hover:text-theme-accent-primary hover:border-theme-accent-primary/50 
                                         hover:shadow-theme-glow
                                         transition-all cursor-pointer"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href="https://twitter.com/ghostlink"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-surface-2 border border-theme-border-medium rounded-lg 
                                         flex items-center justify-center text-theme-text-muted 
                                         hover:text-theme-accent-primary hover:border-theme-accent-primary/50 
                                         hover:shadow-theme-glow
                                         transition-all cursor-pointer"
                            >
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-mono text-sm font-semibold text-theme-text-primary mb-4 tracking-wider">RESOURCES</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer flex items-center gap-1">
                                    Documentation <ExternalLink size={12} />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    Smart Contracts
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-mono text-sm font-semibold text-theme-text-primary mb-4 tracking-wider">COMPANY</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-theme-border-medium flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-theme-text-dim text-xs font-mono">
                        © 2024 GHOSTLINK. ALL_RIGHTS_RESERVED.
                    </p>
                    <div className="flex items-center gap-6 text-xs font-mono text-theme-text-muted">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse 
                                           shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            NETWORK::SEPOLIA
                        </span>
                        <span>POWERED_BY::RISC_ZERO</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
