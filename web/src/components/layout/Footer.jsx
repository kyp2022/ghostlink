import { Github, Twitter, ExternalLink, Ghost } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

export const Footer = ({ onOpenWhitepaper }) => {
    const { t } = useI18n();
    return (
        <footer className="bg-surface-1 border-t border-theme-border-medium py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-theme-accent-primary/10 border border-theme-accent-primary/20 rounded-xl 
                                          flex items-center justify-center shadow-theme-glow">
                                <Ghost className="w-5 h-5 text-theme-accent-primary" />
                            </div>
                            <span className="font-bold text-xl text-theme-text-primary tracking-wide font-display">
                                GHOST<span className="text-theme-accent-primary">LINK</span>
                            </span>
                        </div>
                        <p className="text-theme-text-muted text-sm max-w-md leading-relaxed mb-6">
                            {t('footer.tagline')}
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
                        <h4 className="font-mono text-sm font-semibold text-theme-text-primary mb-4 tracking-wider">{t('footer.resources')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#documentation"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onOpenWhitepaper?.();
                                    }}
                                    className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    {t('footer.documentation')} <ExternalLink size={12} />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    {t('footer.apiReference')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    {t('footer.smartContracts')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-mono text-sm font-semibold text-theme-text-primary mb-4 tracking-wider">{t('footer.company')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    {t('footer.about')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    {t('footer.privacyPolicy')}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-theme-text-muted hover:text-theme-accent-primary text-sm transition-colors cursor-pointer">
                                    {t('footer.terms')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-theme-border-medium flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-theme-text-dim text-xs font-mono">
                        {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-6 text-xs font-mono text-theme-text-muted">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse 
                                           shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            {t('footer.network')}
                        </span>
                        <span>{t('footer.poweredBy')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
