import React from 'react';
import { motion } from 'framer-motion';

const CrystallineCube = ({ size = 120 }) => {
    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size, perspective: '800px' }}
        >
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />

            <motion.div
                className="relative w-1/2 h-1/2"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                    rotateX: [0, 360],
                    rotateY: [0, 360],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* Cube Faces */}
                {[
                    { rotateX: 0, rotateY: 0, translateZ: '40px' },    // Front
                    { rotateX: 0, rotateY: 180, translateZ: '40px' },  // Back
                    { rotateX: 0, rotateY: 90, translateZ: '40px' },   // Right
                    { rotateX: 0, rotateY: -90, translateZ: '40px' },  // Left
                    { rotateX: 90, rotateY: 0, translateZ: '40px' },   // Top
                    { rotateX: -90, rotateY: 0, translateZ: '40px' },  // Bottom
                ].map((style, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 border border-cyan-500/40 bg-cyan-500/5 backdrop-blur-sm"
                        style={{
                            transform: `rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) translateZ(${style.translateZ})`,
                            boxShadow: 'inset 0 0 15px rgba(0, 240, 255, 0.2)',
                        }}
                    >
                        {/* Decorative inner lines */}
                        <div className="absolute inset-2 border-[0.5px] border-cyan-500/20" />
                    </div>
                ))}

                {/* Internal Pulsing Core */}
                <motion.div
                    className="absolute inset-0 m-auto w-1/2 h-1/2 bg-cyan-400 blur-md rounded-full"
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>

            {/* Floating Data Particles around cube */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{
                        x: [
                            Math.cos(i * 90) * 60,
                            Math.cos(i * 90 + 180) * 60,
                            Math.cos(i * 90) * 60
                        ],
                        y: [
                            Math.sin(i * 90) * 60,
                            Math.sin(i * 90 + 180) * 60,
                            Math.sin(i * 90) * 60
                        ],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                    }}
                />
            ))}
        </div>
    );
};

export default CrystallineCube;
