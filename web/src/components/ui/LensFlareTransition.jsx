import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Lens Flare Transition Component
 * Creates a cinematic "light wash" effect during theme switches
 * Respects prefers-reduced-motion accessibility setting
 */
export const LensFlareTransition = () => {
    const { isTransitioning, theme } = useTheme();

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
        return null;
    }

    return (
        <AnimatePresence>
            {isTransitioning && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: 3,
                        opacity: [0, 0.8, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        opacity: {
                            times: [0, 0.5, 1],
                            duration: 0.6
                        }
                    }}
                    className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
                    style={{ mixBlendMode: theme === 'light' ? 'screen' : 'lighten' }}
                >
                    <div
                        className="w-[200vw] h-[200vh]"
                        style={{
                            background: theme === 'light'
                                ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(6,182,212,0.5) 25%, transparent 50%)'
                                : 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(168,85,247,0.4) 25%, transparent 50%)'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LensFlareTransition;
