import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

const ScannerDropzone = ({ onFileSelect, label = "DROP_FILE_FOR_ZK_SCAN" }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <label
            className="relative block cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
                accept=".pdf"
            />

            <div className={`
                relative h-32 rounded-xl border-2 border-dashed transition-all duration-500 overflow-hidden
                flex flex-col items-center justify-center gap-3
                ${isHovered
                    ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'border-white/10 bg-white/2 hover:border-white/20'
                }
            `}>
                {/* Horizontal Scan-line */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ top: '0%' }}
                            animate={{ top: ['0%', '100%', '0%'] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-cyan-400/50 shadow-[0_0_10px_#00F0FF] z-10"
                        />
                    )}
                </AnimatePresence>

                {/* Intense Hover Glow Layer */}
                <motion.div
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none"
                />

                <div className={`
                    transition-all duration-500 
                    ${isHovered ? 'scale-110 text-cyan-400' : 'text-slate-400'}
                `}>
                    <Upload size={24} strokeWidth={1.5} />
                </div>

                <div className="text-center">
                    <div className={`
                        font-mono text-[10px] tracking-[0.2em] transition-colors duration-500
                        ${isHovered ? 'text-cyan-400' : 'text-slate-500'}
                    `}>
                        {label}
                    </div>
                    <div className="font-mono text-[8px] text-slate-600 mt-1 uppercase tracking-widest">
                        Supported: .pdf (Encrypted)
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
            </div>
        </label>
    );
};

export default ScannerDropzone;
