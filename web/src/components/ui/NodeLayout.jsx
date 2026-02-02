import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ZKAnimation from './ZKAnimation';
import { useI18n } from '../../contexts/I18nContext';

export const NodeLayout = ({ sourceIcon, sourceLabel, children }) => {
    const { t } = useI18n();
    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-col md:flex-row items-center justify-between gap-8 p-4 md:p-8">

            {/* Connection Lines (Desktop only for now) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block opacity-30">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                {/* Curve from Node 1 to Node 2 */}
                <path d="M100,250 C150,250 200,250 280,250" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                {/* Curve from Node 2 to Node 3 */}
                <path d="M380,250 C450,250 500,250 550,250" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            </svg>

            {/* Node 1: Source */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center gap-3"
            >
                <div className="w-20 h-20 rounded-2xl bg-surface-elevated-1 border border-theme-accent-primary/30 
                              flex items-center justify-center shadow-theme-glow
                              backdrop-blur-xl">
                    {sourceIcon}
                </div>
                <div className="text-center">
                    <div className="text-xs font-mono text-theme-accent-secondary mb-1">{t('common.source')}</div>
                    <div className="font-bold text-theme-text-primary text-sm tracking-wide">{sourceLabel}</div>
                </div>
            </motion.div>

            {/* Mobile Arrow */}
            <ArrowRight className="md:hidden text-theme-text-muted rotate-90 my-2" />

            {/* Node 2: ZK Core */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-theme-accent-primary/10 blur-xl rounded-full" />
                    <ZKAnimation state="idle" />
                </div>
                <div className="text-xs font-mono text-theme-accent-secondary mt-[-10px] bg-surface-elevated-2/80 px-2 rounded">
                    {t('common.zkCircuit')}
                </div>
            </motion.div>

            {/* Mobile Arrow */}
            <ArrowRight className="md:hidden text-theme-text-muted rotate-90 my-2" />

            {/* Node 3: Interactive Interface */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative z-10 flex-1 w-full max-w-sm"
            >
                <div className="relative group">
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>

                    <div className="relative bg-[#050505] rounded-2xl border border-white/10 p-1">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NodeLayout;
