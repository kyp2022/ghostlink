import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Plus, Check, ShieldCheck, Car } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { ProgressModal } from '../components/ProgressModal';

export const SolutionsPage = ({
    initialVerificationStatus, initialUserData, initialZkProof, onGithubConnect,
    twitterStatus, twitterUser, twitterProof, onTwitterConnect,
    walletAccount, walletSigner
}) => {
    const [activeTab, setActiveTab] = useState('identity');
    const account = walletAccount;
    const signer = walletSigner;

    const {
        mintCredential,
        isMinting,
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
            title: "Enable under-collateralized loans.",
            desc: "Import off-chain credit history from PayPal or Stripe to prove solvency without revealing transactions.",
            mockup: (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                        <div className="font-bold">Aave Loan Market</div>
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs">Wallet Connected</div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-accent">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">GhostLink Score</div>
                                    <div className="text-xs text-gray-500">Source: PayPal</div>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-accent">780</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Max LTV</span>
                                <span className="font-medium text-green-600">85% (Boosted)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="w-[85%] bg-green-500 h-2 rounded-full"></div>
                            </div>
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full flex flex-col">
                    <div className="font-bold mb-6">My Identity Orb</div>
                    <div className="space-y-3">
                        {/* GitHub Item */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Github size={18} />
                                <span className="text-sm">GitHub</span>
                            </div>
                            {initialVerificationStatus === 'success' ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                    <Check size={10} /> Verified
                                </span>
                            ) : (
                                <button
                                    onClick={onGithubConnect}
                                    disabled={initialVerificationStatus === 'loading'}
                                    className="text-xs px-3 py-1.5 rounded transition-colors bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {initialVerificationStatus === 'loading' ? 'Verifying...' : 'Connect'}
                                </button>
                            )}
                        </div>

                        {initialVerificationStatus === 'success' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="text-xs bg-green-50 p-2 rounded border border-green-100 text-green-800"
                            >
                                <p><strong>User:</strong> {initialUserData?.login}</p>
                                <p className="text-[10px] text-green-600 mt-1">✓ Credential minting in progress...</p>
                            </motion.div>
                        )}

                        {/* Twitter Item */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Twitter size={18} />
                                <span className="text-sm">X (Twitter)</span>
                            </div>
                            {twitterStatus === 'success' ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                    <Check size={10} /> Verified
                                </span>
                            ) : (
                                <button
                                    onClick={onTwitterConnect}
                                    disabled={twitterStatus === 'loading'}
                                    className="text-xs px-3 py-1.5 rounded transition-colors bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {twitterStatus === 'loading' ? 'Verifying...' : 'Connect'}
                                </button>
                            )}
                        </div>
                        {twitterStatus === 'success' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="text-xs bg-green-50 p-2 rounded border border-green-100 text-green-800"
                            >
                                <p><strong>User:</strong> {twitterUser?.username || 'Verified'}</p>
                                <p className="text-[10px] text-green-600 mt-1">✓ Credential minting in progress...</p>
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg text-gray-400">
                            <div className="flex items-center gap-3">
                                <Plus size={18} />
                                <span className="text-sm">Add Source</span>
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
