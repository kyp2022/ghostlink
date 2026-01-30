import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Github, Twitter, Check, Lock, Users, Zap } from 'lucide-react';
import { EthereumIcon, UberIcon } from '../components/ui/Icons';
import CrystallineCube from '../components/ui/CrystallineCube';
import ScannerDropzone from '../components/ui/ScannerDropzone';
import { useContract } from '../hooks/useContract';
import { ProgressModal } from '../components/ProgressModal';
import AlipayUpload from '../components/AlipayUpload';
import CryptoPortfolio from '../components/CryptoPortfolio';

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
                        <div className="w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.1)]">
                            <EthereumIcon size={48} className="text-cyan-400" />
                        </div>
                        <div className="font-mono text-xs text-cyan-400 tracking-[0.3em]">ETH_MAINNET</div>
                    </motion.div>
                    <div className="relative"><CrystallineCube size={180} /></div>
                    <div className="flex-1 w-full max-w-md">
                        <motion.div className="bg-[#12141C] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
                            <div className="relative space-y-6 font-mono">
                                <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-2">Solvency_Pass_v1</h4>
                                <div className="space-y-4">
                                    <CryptoPortfolio
                                        walletAccount={account}
                                        walletSigner={signer}
                                        onConnectWallet={onConnectWallet}
                                        mintCredential={mintCredential}
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <span className="text-xs text-slate-600">OR</span>
                                        <div className="h-px flex-1 bg-white/5" />
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
                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center">
                            <UberIcon size={48} className="text-white" />
                        </div>
                        <div className="text-xs text-slate-400 tracking-[0.3em]">APP_DATA_SOURCE</div>
                    </motion.div>
                    <div className="relative"><CrystallineCube size={180} /></div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-[#12141C] border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
                            <Users size={40} className="mx-auto mb-6 text-purple-400" />
                            <h4 className="text-white text-sm font-bold mb-3">EXCLUSIVE_AIRDROP</h4>
                            <p className="text-sm text-slate-500 mb-8 font-professional">Verification required for claim eligibility.</p>
                            <button className="w-full py-4 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-purple-600/40 transition-all cursor-pointer">
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
                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center">
                            <Github size={48} className="text-white" />
                        </div>
                        <div className="text-xs text-slate-400 tracking-[0.3em]">SOCIAL_CREDENTIALS</div>
                    </motion.div>
                    <div className="relative"><CrystallineCube size={180} /></div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-[#12141C] border border-white/10 rounded-2xl p-8 space-y-6">
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
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl border-dashed">
                                <div className="flex items-center gap-4">
                                    <Github size={20} className={initialVerificationStatus === 'success' ? 'text-emerald-400' : 'text-slate-400'} />
                                    <span className="text-xs text-white tracking-widest">GITHUB</span>
                                </div>
                                {initialVerificationStatus === 'success' ? (
                                    <Check size={18} className="text-emerald-400" />
                                ) : (
                                    <button
                                        onClick={onGithubConnect}
                                        disabled={initialVerificationStatus === 'loading'}
                                        className="text-[10px] text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded bg-cyan-500/5 hover:bg-cyan-500/20 transition-all font-bold cursor-pointer"
                                    >
                                        {initialVerificationStatus === 'loading' ? 'Binding...' : 'BIND'}
                                    </button>
                                )}
                            </div>

                            {/* Twitter Connection */}
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl border-dashed">
                                <div className="flex items-center gap-4">
                                    <Twitter size={20} className={twitterStatus === 'success' ? 'text-emerald-400' : 'text-slate-400'} />
                                    <span className="text-xs text-white tracking-widest">TWITTER</span>
                                </div>
                                {twitterStatus === 'success' ? (
                                    <Check size={18} className="text-emerald-400" />
                                ) : (
                                    <button
                                        onClick={onTwitterConnect}
                                        disabled={twitterStatus === 'loading'}
                                        className="text-[10px] text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded bg-cyan-500/5 hover:bg-cyan-500/20 transition-all font-bold cursor-pointer"
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
            <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20 font-mono">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 tracking-[0.2em] uppercase">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]" />
                            System_Solutions::V3
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">PRIVACY_BRIDGE_<span className="text-cyan-400">INTERFACE</span></h2>
                        <p className="text-slate-400 text-base font-professional tracking-wide max-w-xl mx-auto">Transforming fragmented web2 activity into secure, on-chain zero-knowledge proofs.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            {Object.keys(tabContent).map((key) => (
                                <motion.div key={key} onClick={() => setActiveTab(key)} animate={activeTab === key ? { scale: [1, 1.01, 1], x: 8, boxShadow: "0 0 40px rgba(0,240,255,0.05)" } : { x: 0 }} transition={{ duration: 4, repeat: Infinity }} className={`p-6 rounded-xl cursor-pointer transition-all duration-500 border relative group ${activeTab === key ? 'bg-cyan-500/5 border-cyan-400/50' : 'bg-[#0a0a0a] border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'}`}>
                                    {activeTab === key && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_#00f0ff]" />}
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className={`font-bold tracking-tight uppercase font-display transition-all duration-300 ${activeTab === key
                                            ? 'text-lg bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer'
                                            : 'text-sm text-slate-600 group-hover:text-slate-400'}`}>
                                            {tabContent[key].title}
                                        </h3>
                                    </div>
                                    <p className={`leading-relaxed font-bold tracking-tight font-sans transition-colors duration-300 ${activeTab === key
                                        ? 'text-base text-slate-100'
                                        : 'text-sm text-slate-500 line-clamp-2'}`}>
                                        {tabContent[key].desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="lg:col-span-8">
                            <div className="bg-[#080808] border border-white/5 rounded-3xl min-h-[550px] flex items-center justify-center relative overflow-hidden shadow-inner">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeTab} variants={particleExit} initial="initial" animate="animate" exit="exit" className="w-full relative z-10 px-8">
                                        <motion.div variants={scanlineEntry}>{tabContent[activeTab].mockup}</motion.div>
                                    </motion.div>
                                </AnimatePresence>
                                <div className="absolute bottom-6 right-8 font-mono text-[8px] text-slate-700 tracking-[0.5em] uppercase">Status::Secured_By_ZK</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
