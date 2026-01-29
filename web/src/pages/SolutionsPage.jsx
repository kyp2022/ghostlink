import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Plus, Check, ShieldCheck, Car } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { ProgressModal } from '../components/ProgressModal';
import AlipayUpload from '../components/AlipayUpload';
import CryptoPortfolio from '../components/CryptoPortfolio';

export const SolutionsPage = ({
    initialVerificationStatus, initialUserData, initialZkProof, onGithubConnect,
    twitterStatus, twitterUser, twitterProof, onTwitterConnect,
    walletAccount, walletSigner, onConnectWallet
}) => {
    const [activeTab, setActiveTab] = useState('identity');
    const account = walletAccount;
    const signer = walletSigner;

    // Debug: Log wallet props
    console.log('[SolutionsPage] Wallet props received:', { walletAccount, walletSigner: !!walletSigner });

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

    // Show progress modal when loading starts
    useEffect(() => {
        const githubLoading = initialVerificationStatus === 'loading';
        const twitterLoading = twitterStatus === 'loading';

        if (githubLoading) {
            ensureProgressInitialized('GitHub · Proof → Mint');
            setProgressSteps(defaultProgressSteps);
            setCurrentProgressStep(0);
            setShowProgressModal(true);
            return;
        }

        if (twitterLoading) {
            ensureProgressInitialized('X · Proof → Mint');
            setProgressSteps(defaultProgressSteps);
            setCurrentProgressStep(0);
            setShowProgressModal(true);
        }
    }, [initialVerificationStatus, twitterStatus]);

    // When proof arrives, mark step 0 as completed
    useEffect(() => {
        if (initialVerificationStatus === 'success' && initialZkProof) {
            setProgressTitle('GitHub · Proof → Mint');
            setProgressSteps(prev => (prev && prev.length > 0 ? prev : defaultProgressSteps));
            setProgressSteps(prev => prev.map((s, i) =>
                i === 0 ? { ...s, description: 'Proof ready', details: `Proof ID: ${initialZkProof.proofId || 'N/A'}` } : s
            ));
            if (account && signer) {
                setCurrentProgressStep(1);
            } else {
                setProgressSteps(prev => prev.map((s, i) =>
                    i === 1 ? { ...s, description: 'Connect wallet to continue.' } : s
                ));
                setCurrentProgressStep(1);
            }
        }
    }, [initialVerificationStatus, initialZkProof]);

    useEffect(() => {
        if (twitterStatus === 'success' && twitterProof) {
            setProgressTitle('X · Proof → Mint');
            setProgressSteps(prev => (prev && prev.length > 0 ? prev : defaultProgressSteps));
            setProgressSteps(prev => prev.map((s, i) =>
                i === 0 ? { ...s, description: 'Proof ready', details: `Proof ID: ${twitterProof.proofId || 'N/A'}` } : s
            ));
            if (account && signer) {
                setCurrentProgressStep(1);
            } else {
                setProgressSteps(prev => prev.map((s, i) =>
                    i === 1 ? { ...s, description: 'Connect wallet to continue.' } : s
                ));
                setCurrentProgressStep(1);
            }
        }
    }, [twitterStatus, twitterProof]);

    // Auto-mint when verification succeeds
    const githubAutoMintedRef = useRef(false);
    const twitterAutoMintedRef = useRef(false);

    useEffect(() => {
        if (initialVerificationStatus === 'success' && account && initialZkProof && !isMinting && !githubAutoMintedRef.current) {
            githubAutoMintedRef.current = true;
            const timer = setTimeout(() => {
                mintCredential(initialZkProof, 0, true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [initialVerificationStatus, account, initialZkProof, isMinting]);

    useEffect(() => {
        if (twitterStatus === 'success' && account && twitterProof && !isMinting && !twitterAutoMintedRef.current) {
            twitterAutoMintedRef.current = true;
            const timer = setTimeout(() => {
                mintCredential(twitterProof, 1, true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [twitterStatus, account, twitterProof, isMinting]);

    const tabContent = {
        defi: {
            title: "Asset-Pass: Prove Solvency.",
            desc: "Verify your real-world assets (Alipay) or on-chain holdings (Any Wallet) to unlock under-collateralized DeFi loans.",
            mockup: (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Asset-Pass</div>
                                <div className="text-xs text-gray-500">Multi-Source Verification</div>
                            </div>
                        </div>
                        <div className="px-2 py-1 bg-green-100 rounded-full text-[10px] font-medium text-green-700">
                            Production Ready
                        </div>
                    </div>

                    {/* Asset Cards */}
                    <div className="space-y-3 flex-1">
                        {/* On-chain Portfolio */}
                        <div className="rounded-xl p-4 border border-gray-200 bg-gray-50 hover:border-gray-300 transition-all">
                            <CryptoPortfolio
                                walletAccount={account}
                                walletSigner={signer}
                                onConnectWallet={onConnectWallet}
                                mintCredential={mintCredential}
                                setShowProgressModal={setShowProgressModal}
                                setProgressSteps={setProgressSteps}
                                setCurrentProgressStep={setCurrentProgressStep}
                                setProgressTitle={setProgressTitle}
                                defaultProgressSteps={defaultProgressSteps}
                                onVerificationComplete={(data) => {
                                    console.log('Portfolio Verified:', data);
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-gray-400">OR</span>
                            </div>
                        </div>

                        {/* Alipay */}
                        <div className="rounded-xl p-4 border border-gray-200 bg-gray-50 hover:border-gray-300 transition-all">
                            <AlipayUpload
                                walletAccount={account}
                                mintCredential={mintCredential}
                                setShowProgressModal={setShowProgressModal}
                                setProgressSteps={setProgressSteps}
                                setCurrentProgressStep={setCurrentProgressStep}
                                setProgressTitle={setProgressTitle}
                                defaultProgressSteps={defaultProgressSteps}
                                onVerificationComplete={(data) => {
                                    console.log('Alipay Verified:', data);
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span><span className="text-gray-600 font-medium">2</span> verification sources</span>
                            <span>Powered by <span className="text-indigo-500">ZK Proofs</span></span>
                        </div>
                    </div>
                </div>
            )
        },
        growth: {
            title: "Stop bots. Reward humans.",
            desc: "Verify users based on real-world spending power (e.g. Uber rides > 5) to prevent Sybil attacks.",
            mockup: (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full flex flex-col">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-black rounded-full mx-auto mb-2"></div>
                        <div className="font-bold">Exclusive Airdrop</div>
                    </div>
                    <button className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed mb-3">
                        Claim Tokens (Locked)
                    </button>
                    <button className="w-full py-3 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2">
                        <Car size={16} />
                        Verify Uber History
                    </button>
                    <p className="text-center text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                        <Check size={12} />
                        Requirement: 5+ Rides
                    </p>
                </div>
            )
        },
        identity: {
            title: "One Person, One ID.",
            desc: "Link multiple Web2 accounts (Twitter, GitHub, Email) to create a robust, private on-chain identity.",
            mockup: (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Identity Passport</div>
                                <div className="text-xs text-gray-500">Powered by ZK Proofs</div>
                            </div>
                        </div>
                        <div className="px-2 py-1 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">
                            {(initialVerificationStatus === 'success' ? 1 : 0) + (twitterStatus === 'success' ? 1 : 0)}/2 Verified
                        </div>
                    </div>

                    {/* Credential Cards */}
                    <div className="space-y-3 flex-1">
                        {/* GitHub Card */}
                        <motion.div
                            initial={false}
                            animate={{
                                borderColor: initialVerificationStatus === 'success' ? '#22c55e' : '#e5e7eb',
                                backgroundColor: initialVerificationStatus === 'success' ? '#f0fdf4' : '#f9fafb'
                            }}
                            className="rounded-xl p-4 border-2 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${initialVerificationStatus === 'success'
                                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                        : 'bg-gray-900'
                                        }`}>
                                        <Github size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">GitHub</div>
                                        {initialVerificationStatus === 'success' && initialUserData?.login && (
                                            <div className="text-xs text-gray-500">@{initialUserData.login}</div>
                                        )}
                                        {initialVerificationStatus !== 'success' && (
                                            <div className="text-xs text-gray-500">Developer Identity</div>
                                        )}
                                    </div>
                                </div>
                                {initialVerificationStatus === 'success' ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                                    >
                                        <Check size={12} />
                                        <span>Verified</span>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={onGithubConnect}
                                        disabled={initialVerificationStatus === 'loading'}
                                        className="px-4 py-2 rounded-lg text-xs font-medium transition-all bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {initialVerificationStatus === 'loading' ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>Connect</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Twitter Card */}
                        <motion.div
                            initial={false}
                            animate={{
                                borderColor: twitterStatus === 'success' ? '#22c55e' : '#e5e7eb',
                                backgroundColor: twitterStatus === 'success' ? '#f0fdf4' : '#f9fafb'
                            }}
                            className="rounded-xl p-4 border-2 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${twitterStatus === 'success'
                                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                        : 'bg-sky-500'
                                        }`}>
                                        <Twitter size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">X (Twitter)</div>
                                        {twitterStatus === 'success' && twitterUser?.username && (
                                            <div className="text-xs text-gray-500">@{twitterUser.username}</div>
                                        )}
                                        {twitterStatus !== 'success' && (
                                            <div className="text-xs text-gray-500">Social Identity</div>
                                        )}
                                    </div>
                                </div>
                                {twitterStatus === 'success' ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                                    >
                                        <Check size={12} />
                                        <span>Verified</span>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={onTwitterConnect}
                                        disabled={twitterStatus === 'loading'}
                                        className="px-4 py-2 rounded-lg text-xs font-medium transition-all bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {twitterStatus === 'loading' ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>Connect</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Add More Card */}
                        <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Plus size={18} />
                                <span className="text-sm font-medium">Add More Sources</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    return (
        <>
            <ProgressModal
                isOpen={showProgressModal}
                onClose={() => setShowProgressModal(false)}
                title={progressTitle}
                steps={progressSteps}
                currentStep={currentProgressStep}
                mintStatus={mintStatus}
            />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold mb-4">Unlock the value of Web2 data.</h2>
                    <p className="text-text-muted">Bridge the gap between off-chain reputation and on-chain utility.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Tabs Navigation */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        {Object.keys(tabContent).map((key) => (
                            <div
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${activeTab === key
                                    ? 'bg-white border-gray-200 shadow-sm'
                                    : 'bg-transparent border-transparent hover:bg-white/50'
                                    }`}
                            >
                                <h3 className={`font-semibold text-lg mb-1 ${activeTab === key ? 'text-accent' : 'text-text'}`}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </h3>
                                <p className="text-sm text-text-muted leading-relaxed">
                                    {activeTab === key ? tabContent[key].desc : ""}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Visual Mockup */}
                    <div className="lg:col-span-8">
                        <div className="bg-[#F0F2F5] p-8 rounded-3xl h-[500px] flex items-center justify-center relative overflow-hidden">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="w-full max-w-md"
                            >
                                {tabContent[activeTab].mockup}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
