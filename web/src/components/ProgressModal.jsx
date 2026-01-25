import { motion } from 'framer-motion';
import { Check, X, ArrowDown } from 'lucide-react';

export const ProgressModal = ({ isOpen, onClose, title, steps, currentStep }) => {
    if (!isOpen) return null;

    const stepStatus = (stepIndex) => {
        if (currentStep >= steps.length) return 'completed';
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'active';
        return 'pending';
    };

    const getStepIcon = (status) => {
        if (status === 'completed') {
            return <Check size={20} className="text-green-600" />;
        }
        if (status === 'active') {
            return <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>;
        }
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold tracking-tight">{title || 'Progress'}</h3>
                    {currentStep >= steps.length && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {steps.map((step, index) => {
                        const status = stepStatus(index);
                        const isLast = index === steps.length - 1;
                        return (
                            <div key={index} className="relative">
                                <div
                                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors ${status === 'active'
                                            ? 'border-accent bg-blue-50/40'
                                            : status === 'completed'
                                                ? 'border-green-200 bg-green-50/40'
                                                : 'border-gray-200 bg-gray-50/30'
                                        }`}
                                >
                                    <div className="flex flex-col items-center w-6">
                                        {getStepIcon(status)}
                                        {!isLast && (
                                            <div className="mt-2 text-gray-300">
                                                <ArrowDown size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium ${status === 'active'
                                                ? 'text-accent'
                                                : status === 'completed'
                                                    ? 'text-green-700'
                                                    : 'text-gray-700'
                                            }`}>
                                            {step.title}
                                        </div>
                                        {step.description && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {step.description}
                                            </div>
                                        )}
                                        {step.details && (status === 'active' || status === 'completed') && (
                                            <div className={`text-[11px] mt-2 font-mono break-all ${status === 'completed' ? 'text-green-700' : 'text-gray-700'
                                                }`}>
                                                {step.details}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {currentStep >= steps.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                    >
                        <button
                            onClick={onClose}
                            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
