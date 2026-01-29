import { motion } from 'framer-motion';
import { Check, X, ArrowDown, ExternalLink, Sparkles, Trophy, AlertCircle } from 'lucide-react';

export const ProgressModal = ({ isOpen, onClose, title, steps, currentStep, mintStatus }) => {
    if (!isOpen) return null;

    const isCompleted = currentStep >= steps.length;
    const isSuccess = isCompleted && mintStatus?.type === 'success';
    const isError = mintStatus?.type === 'error' || (steps[currentStep]?.description?.startsWith('Failed')); // Heuristic for error if mintStatus not full populated

    // Allow closing if completed OR if error
    const canClose = isCompleted || isError;

    const stepStatus = (stepIndex) => {
        if (isError && stepIndex === currentStep) return 'error';
        if (currentStep >= steps.length) return 'completed';
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'active';
        return 'pending';
    };

    const getStepIcon = (status) => {
        if (status === 'completed') {
            return <Check size={20} className="text-green-600" />;
        }
        if (status === 'error') {
            return <X size={20} className="text-red-600" />;
        }
        if (status === 'active') {
            return <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>;
        }
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>;
    };

    const getSepoliaExplorerUrl = (txHash) => {
        return `https://sepolia.etherscan.io/tx/${txHash}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-100 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        {isSuccess && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                                className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                            >
                                <Trophy size={20} className="text-white" />
                            </motion.div>
                        )}
                        {isError && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
                            >
                                <AlertCircle size={20} className="text-red-600" />
                            </motion.div>
                        )}
                        <h3 className="text-xl font-bold tracking-tight">{title || 'Progress'}</h3>
                    </div>
                    {/* Always show close button if completed or error */}
                    {canClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Success Celebration */}
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles size={20} className="text-green-600" />
                            <span className="font-semibold text-green-800">Credential Minted!</span>
                        </div>
                        <p className="text-sm text-green-700 mb-3">
                            Your identity credential is now permanently recorded on the blockchain.
                        </p>
                        {mintStatus?.txHash && (
                            <a
                                href={getSepoliaExplorerUrl(mintStatus.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900 transition-colors bg-white px-3 py-2 rounded-lg border border-green-200 hover:border-green-300"
                            >
                                <ExternalLink size={14} />
                                View on Etherscan
                            </a>
                        )}
                    </motion.div>
                )}

                {/* Error State Message - Optional if step shows it, but good for summary */}
                {isError && mintStatus?.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100"
                    >
                        <p className="text-sm text-red-700 font-medium">Process Failed</p>
                        <p className="text-xs text-red-600 mt-1">{mintStatus.message}</p>
                    </motion.div>
                )}

                {/* Progress Steps */}
                <div className="space-y-2">
                    {steps.map((step, index) => {
                        const status = stepStatus(index);
                        const isLast = index === steps.length - 1;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <div
                                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${status === 'active'
                                        ? 'border-accent bg-blue-50/60 shadow-sm'
                                        : status === 'completed'
                                            ? 'border-green-200 bg-green-50/40'
                                            : status === 'error'
                                                ? 'border-red-200 bg-red-50/60'
                                                : 'border-gray-100 bg-gray-50/30'
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
                                                : status === 'error'
                                                    ? 'text-red-700'
                                                    : 'text-gray-500'
                                            }`}>
                                            {step.title}
                                        </div>
                                        {step.description && (
                                            <div className={`text-xs mt-1 ${status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                                                {step.description}
                                            </div>
                                        )}
                                        {step.details && (status === 'active' || status === 'completed' || status === 'error') && (
                                            <div className={`text-[11px] mt-2 font-mono break-all px-2 py-1 rounded ${status === 'completed' ? 'bg-green-100 text-green-700' :
                                                status === 'error' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {step.details}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer */}
                {canClose && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-gray-100"
                    >
                        <button
                            onClick={onClose}
                            className={`w-full py-3 rounded-xl font-medium transition-all shadow-lg ${isError
                                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                                : 'bg-gradient-to-r from-gray-900 to-black text-white hover:opacity-90 shadow-black/10'
                                }`}
                        >
                            {isSuccess ? 'Done' : 'Close'}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
