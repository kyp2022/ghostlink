import React from 'react';
import { motion } from 'framer-motion';

export const ZKAnimation = ({ state = 'proving' }) => {
    // state: 'idle' | 'proving' | 'verified'

    const particles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        angle: (i * 360) / 12,
        delay: i * 0.1
    }));

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Core ZK Crystal */}
            <motion.div
                className="absolute w-12 h-12 bg-cyan-500/20 rotate-45 border-2 border-cyan-400 z-10"
                animate={{
                    scale: state === 'verified' ? [1, 1.2, 1] : [1, 1.1, 1],
                    boxShadow: state === 'verified'
                        ? "0 0 50px rgba(0,255,255,0.8)"
                        : ["0 0 20px rgba(0,255,255,0.2)", "0 0 30px rgba(0,255,255,0.4)", "0 0 20px rgba(0,255,255,0.2)"],
                    borderColor: state === 'verified' ? "#00FFFF" : "rgba(34,211,238,0.5)"
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Inner Core Pulse (Verified state) */}
            {state === 'verified' && (
                <motion.div
                    className="absolute w-12 h-12 bg-white/50 rotate-45 z-20"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: 1.5 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}

            {/* Converging Particles (Web2 Data -> Proof) */}
            {state === 'proving' && particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
                    initial={{
                        x: Math.cos(p.angle * Math.PI / 180) * 60,
                        y: Math.sin(p.angle * Math.PI / 180) * 60,
                        opacity: 0
                    }}
                    animate={{
                        x: 0,
                        y: 0,
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeIn"
                    }}
                />
            ))}

            {/* Orbital Rings (Idle/Proving) */}
            <motion.div
                className="absolute w-24 h-24 border border-slate-700/50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute w-20 h-20 border border-slate-600/30 rounded-full border-dashed"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
};

export default ZKAnimation;
