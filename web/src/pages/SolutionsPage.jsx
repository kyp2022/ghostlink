import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Github, Twitter, Check, Lock, Users, Zap } from 'lucide-react';
import { EthereumIcon, UberIcon } from '../components/ui/Icons';
import CrystallineCube from '../components/ui/CrystallineCube';

import { useContract } from '../hooks/useContract';
import { ProgressModal } from '../components/ProgressModal';
import AlipayUpload from '../components/AlipayUpload';
import CryptoPortfolio from '../components/CryptoPortfolio';
import { useTheme } from '../contexts/ThemeContext';

// Transition variants
const particleExit = {
    initial: { opacity: 0, scale: 0.9, filter: 'blur(0px)' },
    animate: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        scale: 1.1,
        filter: 'blur(20px)',
        transition: { duration: 0.4, ease: "easeIn" }
    }
};

const scanlineEntry = {
    initial: { clipPath: 'inset(0 100% 0 0)', x: 20 },
    animate: {
        clipPath: 'inset(0 0% 0 0)',
        x: 0,
        transition: { duration: 0.8, ease: "anticipate" }
    }
};

export const SolutionsPage = ({
    initialVerificationStatus, initialUserData, initialZkProof, onGithubConnect,
    twitterStatus, twitterUser, twitterProof, onTwitterConnect,
    walletAccount, walletSigner, onConnectWallet
}) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [activeTab, setActiveTab] = useState('defi');
    const account = walletAccount;
    const signer = walletSigner;

    const {
        mintCredential,
        isMinting,
        mintStatus,
        progressSteps,
        currentProgressStep,
        showProgressModal,
        setShowProgressModal,
        setProgressSteps,
        setCurrentProgressStep,
        progressTitle,
        setProgressTitle,
        defaultProgressSteps,
        ensureProgressInitialized
    } = useContract(signer, account);

    // Auto-progress effects...
    useEffect(() => {
        const githubLoading = initialVerificationStatus === 'loading';
        const twitterLoading = twitterStatus === 'loading';
        if (githubLoading || twitterLoading) {
            ensureProgressInitialized(githubLoading ? 'GitHub · Proof → Mint' : 'X · Proof → Mint');
            setProgressSteps(defaultProgressSteps);
            setCurrentProgressStep(0);
            setShowProgressModal(true);
        }
    }, [initialVerificationStatus, twitterStatus]);

    useEffect(() => {
        if ((initialVerificationStatus === 'success' && initialZkProof) || (twitterStatus === 'success' && twitterProof)) {
            const isTwitter = twitterStatus === 'success';
            setProgressTitle(isTwitter ? 'X · Proof → Mint' : 'GitHub · Proof → Mint');
            setProgressSteps(prev => (prev && prev.length > 0 ? prev : defaultProgressSteps));
            setProgressSteps(prev => prev.map((s, i) =>
                i === 0 ? { ...s, description: 'Proof ready', details: `Proof ID: ${(isTwitter ? twitterProof : initialZkProof).proofId || 'N/A'}` } : s
            ));
            setCurrentProgressStep(1);
        }
    }, [initialVerificationStatus, initialZkProof, twitterStatus, twitterProof]);

    const tabContent = {
        defi: {
            title: "Asset-Pass",
            desc: "Verify your real-world assets or on-chain holdings to unlock under-collateralized DeFi loans.",
            mockup: (
                <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-8 p-6">
                    <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }} className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-surface-elevated-1 dark:bg-cyan-500/10 border border-theme-border-medium dark:border-cyan-500/30 flex items-center justify-center shadow-theme-strong dark:shadow-[0_0_40px_rgba(0,240,255,0.1)]">
                            <EthereumIcon size={48} className="text-theme-accent-primary dark:text-cyan-400" />
                        </div>
                        <div className="font-mono text-xs text-theme-accent-primary dark:text-cyan-400 tracking-[0.3em]">ETH_MAINNET</div>
                    </motion.div>
                    <div className="relative"><CrystallineCube size={180} /></div>
                    <div className="flex-1 w-full max-w-md">
                        <motion.div className="bg-surface-1 border border-theme-border-strong rounded-2xl p-8 shadow-theme-strong relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
                            <div className="relative space-y-6 font-mono">
                                <h4 className="text-xs font-bold text-theme-text-primary dark:text-white tracking-widest uppercase mb-2">Solvency_Pass_v1</h4>
                                <div className="space-y-4">
                                    <CryptoPortfolio
                                        walletAccount={account}
                                        walletSigner={signer}
                                        onConnectWallet={onConnectWallet}
                                        mintCredential={mintCredential}
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-theme-border-medium" />
                                        <span className="text-xs text-theme-text-muted">OR</span>
                                        <div className="h-px flex-1 bg-theme-border-medium" />
                                    </div>
                                    <AlipayUpload
                                        walletAccount={account}
                                        mintCredential={mintCredential}
                                        setShowProgressModal={setShowProgressModal}
                                        setProgressSteps={setProgressSteps}
                                        setCurrentProgressStep={setCurrentProgressStep}
                                        setProgressTitle={setProgressTitle}
                                        defaultProgressSteps={defaultProgressSteps}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )
        },
        growth: {
            title: "Sybil Guard",
            desc: "Verify users based on real-world spending power (e.g. Uber rides > 5) to prevent Sybil attacks.",
            mockup: (
                <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-8 p-6 font-mono">
                    <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }} className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-surface-elevated-1 border border-theme-border-medium flex items-center justify-center shadow-theme-glow">
                            <UberIcon size={48} className="text-theme-text-primary" />
                        </div>
                        <div className="text-xs text-theme-text-muted tracking-[0.3em]">APP_DATA_SOURCE</div>
                    </motion.div>
                    <div className="relative"><CrystallineCube size={180} /></div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-surface-1 border border-theme-border-strong rounded-2xl p-8 text-center relative overflow-hidden shadow-theme-strong">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
                            <Users size={40} className="mx-auto mb-6 text-theme-accent-secondary dark:text-purple-400" />
                            <h4 className="text-theme-text-primary dark:text-white text-sm font-bold mb-3">EXCLUSIVE_AIRDROP</h4>
                            <p className="text-sm text-theme-text-muted mb-8 font-professional">Verification required for claim eligibility.</p>
                            <button className="w-full py-4 bg-theme-accent-secondary/10 dark:bg-purple-600/20 border border-theme-accent-secondary/30 dark:border-purple-500/30 text-theme-accent-secondary dark:text-purple-400 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-theme-accent-secondary/20 transition-all cursor-pointer">
                                PROVE_RIDE_HISTORY
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        identity: {
            title: "Identity Bridge",
            desc: "Link multiple Web2 accounts to create a robust, private on-chain identity.",
            mockup: (
                <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-8 p-6 font-mono">
                    <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }} className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-surface-elevated-1 border border-theme-border-medium flex items-center justify-center shadow-theme-glow">
                            <Github size={48} className="text-theme-text-primary" />
                        </div>
                        <div className="text-xs text-theme-text-muted tracking-[0.3em]">SOCIAL_CREDENTIALS</div>
                    </motion.div>
                    <div className="relative"><CrystallineCube size={180} /></div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-surface-1 border border-theme-border-strong rounded-2xl p-8 space-y-6 shadow-theme-strong">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs text-slate-400">PASSPORT_v2</span>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                    <span className="text-cyan-400 text-[10px] uppercase tracking-tighter font-bold">
                                        {(initialVerificationStatus === 'success' ? 1 : 0) + (twitterStatus === 'success' ? 1 : 0)} Active
                                    </span>
                                </div>
                            </div>

                            {/* GitHub Connection */}
                            <div className="flex items-center justify-between p-4 bg-surface-elevated-2 dark:bg-white/5 border border-theme-border-medium dark:border-white/5 rounded-xl border-dashed">
                                <div className="flex items-center gap-4">
                                    <Github size={20} className={initialVerificationStatus === 'success' ? 'text-emerald-400' : 'text-theme-text-muted'} />
                                    <span className="text-xs text-theme-text-primary dark:text-white tracking-widest">GITHUB</span>
                                </div>
                                {initialVerificationStatus === 'success' ? (
                                    <Check size={18} className="text-emerald-400" />
                                ) : (
                                    <button
                                        onClick={onGithubConnect}
                                        disabled={initialVerificationStatus === 'loading'}
                                        className="text-[10px] text-theme-accent-primary dark:text-cyan-400 border border-theme-accent-primary/30 dark:border-cyan-500/30 px-3 py-1.5 rounded bg-theme-accent-primary/5 dark:bg-cyan-500/5 hover:bg-theme-accent-primary/20 transition-all font-bold cursor-pointer"
                                    >
                                        {initialVerificationStatus === 'loading' ? 'Binding...' : 'BIND'}
                                    </button>
                                )}
                            </div>

                            {/* Twitter Connection */}
                            <div className="flex items-center justify-between p-4 bg-surface-elevated-2 dark:bg-white/5 border border-theme-border-medium dark:border-white/5 rounded-xl border-dashed">
                                <div className="flex items-center gap-4">
                                    <Twitter size={20} className={twitterStatus === 'success' ? 'text-emerald-400' : 'text-theme-text-muted'} />
                                    <span className="text-xs text-theme-text-primary dark:text-white tracking-widest">TWITTER</span>
                                </div>
                                {twitterStatus === 'success' ? (
                                    <Check size={18} className="text-emerald-400" />
                                ) : (
                                    <button
                                        onClick={onTwitterConnect}
                                        disabled={twitterStatus === 'loading'}
                                        className="text-[10px] text-theme-accent-primary dark:text-cyan-400 border border-theme-accent-primary/30 dark:border-cyan-500/30 px-3 py-1.5 rounded bg-theme-accent-primary/5 dark:bg-cyan-500/5 hover:bg-theme-accent-primary/20 transition-all font-bold cursor-pointer"
                                    >
                                        {twitterStatus === 'loading' ? 'Binding...' : 'BIND'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    return (
        <>
            <ProgressModal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} title={progressTitle} steps={progressSteps} currentStep={currentProgressStep} mintStatus={mintStatus} />

            {/* BIFURCATED LAYOUT: Dark Mode = Vertical Stack | Light Mode = Studio Workbench */}
            {isLight ? (
                /* ============== LIGHT MODE: Studio Workbench Layout ============== */
                <div className="min-h-screen bg-white">
                    {/* Page Header - Clean & Professional */}
                    <div className="border-b border-slate-200 bg-white px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                                    Privacy Bridge <span className="text-amber-500">Interface</span>
                                </h1>
                                <p className="text-sm text-slate-500 mt-1 font-sans">
                                    Transform fragmented web2 activity into secure ZK proofs
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="status-light success">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    SYSTEM ONLINE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Workbench Grid: 1/3 Controls + 2/3 Canvas */}
                    <div className="layout-workbench p-8">
                        {/* LEFT: Control Panel */}
                        <div className="control-panel">
                            {/* Tab Navigation */}
                            <div className="border-b border-slate-200">
                                <div className="flex">
                                    {Object.keys(tabContent).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveTab(key)}
                                            className={`
                                                flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider
                                                border-b-2 transition-all cursor-pointer
                                                ${activeTab === key
                                                    ? 'border-slate-900 text-slate-900 bg-slate-50'
                                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                                }
                                            `}
                                        >
                                            {tabContent[key].title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content Description */}
                            <div className="p-6 border-b border-slate-200 bg-slate-50">
                                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                                    {tabContent[activeTab].desc}
                                </p>
                            </div>

                            {/* Input Controls */}
                            <div className="p-6 space-y-4">
                                {activeTab === 'defi' && (
                                    <>
                                        <CryptoPortfolio
                                            walletAccount={account}
                                            walletSigner={signer}
                                            onConnectWallet={onConnectWallet}
                                            mintCredential={mintCredential}
                                        />
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <span className="text-xs text-slate-400 font-medium">OR</span>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>
                                        <AlipayUpload
                                            walletAccount={account}
                                            mintCredential={mintCredential}
                                            setShowProgressModal={setShowProgressModal}
                                            setProgressSteps={setProgressSteps}
                                            setCurrentProgressStep={setCurrentProgressStep}
                                            setProgressTitle={setProgressTitle}
                                            defaultProgressSteps={defaultProgressSteps}
                                        />
                                    </>
                                )}
                                {activeTab === 'growth' && (
                                    <div className="text-center py-8 text-slate-400">
                                        <Users size={32} className="mx-auto mb-3 text-slate-300" />
                                        <p className="text-sm">Sybil Guard controls</p>
                                    </div>
                                )}
                                {activeTab === 'identity' && (
                                    <div className="space-y-3">
                                        {/* GitHub */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Github size={18} className={initialVerificationStatus === 'success' ? 'text-emerald-500' : 'text-slate-400'} />
                                                <span className="text-sm font-medium text-slate-700">GitHub</span>
                                            </div>
                                            {initialVerificationStatus === 'success' ? (
                                                <span className="status-light success">Verified</span>
                                            ) : (
                                                <button
                                                    onClick={onGithubConnect}
                                                    disabled={initialVerificationStatus === 'loading'}
                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                                >
                                                    {initialVerificationStatus === 'loading' ? 'Binding...' : 'Connect'}
                                                </button>
                                            )}
                                        </div>
                                        {/* Twitter */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Twitter size={18} className={twitterStatus === 'success' ? 'text-emerald-500' : 'text-slate-400'} />
                                                <span className="text-sm font-medium text-slate-700">Twitter / X</span>
                                            </div>
                                            {twitterStatus === 'success' ? (
                                                <span className="status-light success">Verified</span>
                                            ) : (
                                                <button
                                                    onClick={onTwitterConnect}
                                                    disabled={twitterStatus === 'loading'}
                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                                >
                                                    {twitterStatus === 'loading' ? 'Binding...' : 'Connect'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Canvas Area */}
                        <div className="canvas-area flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-full flex items-center justify-center p-8"
                                >
                                    {/* Simplified visualization for Light Mode */}
                                    <div className="text-center">
                                        <CrystallineCube size={200} />
                                        <p className="mt-6 text-xs text-slate-400 font-mono uppercase tracking-widest">
                                            ZK_PROOF_ENGINE :: {tabContent[activeTab].title}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Status Footer */}
                            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                                Status::Secured_By_ZK
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ============== DARK MODE: Original Vertical Stack Layout ============== */
                <div className="min-h-screen bg-gradient-to-b from-surface-base via-surface-1 to-surface-base pt-32 pb-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-2xl mx-auto mb-20 font-mono">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 tracking-[0.2em] uppercase">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]" />
                                System_Solutions::V3
                            </motion.div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-theme-text-primary tracking-tight">PRIVACY_BRIDGE_<span className="text-cyan-400">INTERFACE</span></h2>
                            <p className="text-theme-text-secondary text-base font-professional tracking-wide max-w-xl mx-auto">Transforming fragmented web2 activity into secure, on-chain zero-knowledge proofs.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4 flex flex-col gap-4">
                                {Object.keys(tabContent).map((key) => (
                                    <motion.div key={key} onClick={() => setActiveTab(key)} animate={activeTab === key ? { scale: [1, 1.01, 1], x: 8 } : { x: 0 }} transition={{ duration: 4, repeat: Infinity }} className={`p-6 rounded-xl cursor-pointer transition-all duration-500 border relative group ${activeTab === key ? 'bg-theme-accent-primary/5 border-theme-accent-primary/50 shadow-theme-glow' : 'bg-surface-1 border-theme-border-medium hover:border-theme-border-strong opacity-60 hover:opacity-100'}`}>
                                        {activeTab === key && <div className="absolute left-0 top-0 bottom-0 w-1 bg-theme-accent-primary dark:bg-cyan-400 shadow-[0_0_15px_#00f0ff] dark:shadow-[0_0_15px_#00f0ff]" />}
                                        <div className="flex items-center gap-4 mb-3">
                                            <h3 className={`font-bold tracking-tight uppercase font-display transition-all duration-300 ${activeTab === key
                                                ? 'text-lg text-theme-accent-primary dark:bg-gradient-to-r dark:from-cyan-400 dark:via-purple-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent dark:bg-[length:200%_auto] dark:animate-shimmer'
                                                : 'text-sm text-theme-text-muted group-hover:text-theme-text-secondary'}`}>
                                                {tabContent[key].title}
                                            </h3>
                                        </div>
                                        <p className={`leading-relaxed font-bold tracking-tight font-sans transition-colors duration-300 ${activeTab === key
                                            ? 'text-base text-theme-text-primary dark:text-slate-100'
                                            : 'text-sm text-theme-text-muted line-clamp-2'}`}>
                                            {tabContent[key].desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="lg:col-span-8">
                                <div className="bg-surface-base border border-theme-border-medium rounded-3xl min-h-[550px] flex items-center justify-center relative overflow-hidden shadow-inner">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
                                    <AnimatePresence mode="wait">
                                        <motion.div key={activeTab} variants={particleExit} initial="initial" animate="animate" exit="exit" className="w-full relative z-10 px-8">
                                            <motion.div variants={scanlineEntry}>{tabContent[activeTab].mockup}</motion.div>
                                        </motion.div>
                                    </AnimatePresence>
                                    <div className="absolute bottom-6 right-8 font-mono text-[8px] text-theme-text-muted tracking-[0.5em] uppercase">Status::Secured_By_ZK</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
