import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import ZKAnimation from './ui/ZKAnimation';



// Step indicator with neon styling
const StepIndicator = ({ step, index, isActive, isCompleted, isError }) => {
    const getStepStatus = () => {
        if (isError) return 'error';
        if (isCompleted) return 'completed';
        if (isActive) return 'active';
        return 'pending';
    };

    const status = getStepStatus();

    const statusStyles = {
        completed: 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
        active: 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)] animate-pulse',
        error: 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]',
        pending: 'bg-surface-elevated-1 border-theme-border-medium'
    };

    const textStyles = {
        completed: 'text-emerald-400',
        active: 'text-cyan-300',
        error: 'text-red-400',
        pending: 'text-theme-text-muted'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 py-3"
        >
            {/* Step number/icon */}
            <div className={`
                w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                transition-all duration-300 ${statusStyles[status]}
            `}>
                {status === 'completed' && <Check size={16} className="text-white" />}
                {status === 'active' && <Loader2 size={16} className="text-cyan-300 animate-spin" />}
                {status === 'error' && <X size={16} className="text-red-400" />}
                {status === 'pending' && <span className="text-xs font-mono text-theme-text-muted">{index + 1}</span>}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium font-mono ${textStyles[status]}`}>
                    {step.description || `Step ${index + 1}`}
                </p>
                {step.details && (
                    <p className="text-xs text-theme-text-muted mt-1 truncate font-mono">
                        {step.details}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export const ProgressModal = ({
    isOpen,
    onClose,
    title = null,
    steps = [],
    currentStep = 0,
    mintStatus = null
}) => {
    const isCompleted = mintStatus?.type === 'success';
    const isError = mintStatus?.type === 'error';
    const showCloseButton = isCompleted || isError;
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const { t } = useI18n();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop with blur */}
                <div
                    className={`absolute inset-0 ${isLight ? 'bg-slate-900/30' : 'bg-surface-base/80 dark:bg-black/80'} backdrop-blur-md`}
                    onClick={showCloseButton ? onClose : undefined}
                />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto
                                   border border-theme-border-medium rounded-2xl
                                   shadow-theme-strong
                                   ${isLight
                        ? 'bg-white/100 backdrop-blur-none'
                        : 'bg-surface-elevated-2/95 backdrop-blur-xl'
                    }`}
            >
                        {/* Glowing top border */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-accent-primary to-transparent" />

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-theme-border-medium">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-theme-accent-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                                <h2 className="text-lg font-semibold text-theme-text-primary font-mono tracking-wide">
                                    {title || t('modal.processing')}
                                </h2>
                            </div>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg bg-surface-elevated-1 border border-theme-border-medium 
                                             flex items-center justify-center text-theme-text-muted 
                                             hover:text-theme-text-primary hover:border-theme-accent-primary/50 
                                             transition-all duration-200 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Loading Animation */}
                            {!isCompleted && !isError && (
                                <div className="mb-8">
                                    <ZKAnimation state={currentStep > 0 ? 'proving' : 'idle'} />
                                    <p className="text-center text-theme-accent-primary text-sm font-mono mt-4 animate-pulse">
                                        {t('modal.zkGenerating')}
                                    </p>
                                </div>
                            )}

                            {/* Success State */}
                            {isCompleted && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mb-6 text-center"
                                >
                                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full 
                                                    flex items-center justify-center border-2 border-emerald-500 dark:border-emerald-400
                                                    shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                        <Check size={32} className="text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-emerald-500 dark:text-emerald-400 font-mono mt-4 text-sm">
                                        {t('modal.mintSuccess')}
                                    </p>
                                    {mintStatus.txHash && (
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${mintStatus.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-theme-accent-primary hover:text-theme-accent-secondary mt-2 block font-mono underline"
                                        >
                                            {t('modal.viewOnEtherscan')}
                                        </a>
                                    )}
                                </motion.div>
                            )}

                            {/* Error State */}
                            {isError && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mb-6 text-center"
                                >
                                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full 
                                                    flex items-center justify-center border-2 border-red-500
                                                    shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                        <AlertCircle size={32} className="text-red-500 dark:text-red-400" />
                                    </div>
                                    <p className="text-red-500 dark:text-red-400 font-mono mt-4 text-sm">
                                        {t('modal.errorPrefix')}{mintStatus.message || 'UNKNOWN'}
                                    </p>
                                </motion.div>
                            )}

                            {/* Steps */}
                            <div className="space-y-1">
                                {steps.map((step, index) => (
                                    <StepIndicator
                                        key={index}
                                        step={step}
                                        index={index}
                                        isActive={index === currentStep && !isCompleted && !isError}
                                        isCompleted={index < currentStep || isCompleted}
                                        isError={isError && index === currentStep}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        {showCloseButton && (
                            <div className="p-6 pt-0">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-xl font-medium text-sm
                                             bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary
                                             text-white shadow-theme-glow
                                             hover:shadow-theme-strong
                                             transition-all duration-300 cursor-pointer font-mono"
                                >
                                    {isCompleted ? 'CLOSE' : 'DISMISS'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProgressModal;
