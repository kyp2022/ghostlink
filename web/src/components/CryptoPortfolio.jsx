import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Loader2, AlertCircle, Info, Zap } from 'lucide-react';
import { ethers } from 'ethers';
import { CREDENTIAL_TYPE, CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/constants';
import { ENDPOINTS } from '../config/endpoints';
import { EthereumIcon } from './ui/Icons';

// Wallet icon with glow
import walletIcon from '../assets/wallet.svg';

const REQUIRED_TX_COUNT = 10;

const CryptoPortfolio = ({
    walletAccount,
    walletSigner,
    onConnectWallet,
    mintCredential,
    setShowProgressModal,
    setProgressSteps,
    setCurrentProgressStep,
    setProgressTitle,
    defaultProgressSteps,
    onVerificationComplete
}) => {
    const [status, setStatus] = useState('idle'); // idle, verifying, success, generating_proof, minted, error
    const [balance, setBalance] = useState('0.00');
    const [txCount, setTxCount] = useState(0);
    const [signature, setSignature] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleConnect = async () => {
        if (onConnectWallet) {
            await onConnectWallet();
        }
    };

    const handleVerify = async () => {
        if (!walletSigner || !walletAccount) {
            setError('Wallet not connected');
            return;
        }

        setStatus('verifying');
        setError('');

        try {
            // 1. Request signature
            const msg = `GhostLink Verification\nAddress: ${walletAccount} \nTimestamp: ${Date.now()} `;
            setMessage(msg);

            const sig = await walletSigner.signMessage(msg);
            setSignature(sig);

            // 2. Get balance
            const provider = walletSigner.provider;
            const balanceWei = await provider.getBalance(walletAccount);
            const formattedBalance = ethers.utils.formatEther(balanceWei);
            setBalance(parseFloat(formattedBalance).toFixed(4));

            // 3. Get transaction count
            const transactionCount = await provider.getTransactionCount(walletAccount);
            setTxCount(transactionCount);

            // 4. Local Verification Complete
            setStatus('success');

            if (onVerificationComplete) {
                onVerificationComplete({
                    provider: 'on-chain',
                    verified: true,
                    asset_amount: formattedBalance,
                    transaction_count: transactionCount,
                    has_10_plus_tx: transactionCount >= REQUIRED_TX_COUNT,
                    address: walletAccount,
                    signature: sig
                });
            }
        } catch (err) {
            console.error('Verification error:', err);
            setStatus('error');
            setError(err.message || 'Verification failed');
        }
    };

    const handleMint = async () => {
        setStatus('generating_proof');
        setError('');

        try {
            // Initialize progress modal
            if (setProgressTitle && setProgressSteps && setCurrentProgressStep && setShowProgressModal) {
                setProgressTitle('WALLET · ZK_PROOF → MINT');
                setProgressSteps([
                    { title: 'Generate ZK Proof', description: 'ZK_PROVER::INITIALIZING...' },
                    { title: 'Prepare Transaction', description: 'TX::PREPARING...' },
                    { title: 'Confirm in Wallet', description: 'WALLET::AWAITING_CONFIRMATION...' },
                    { title: 'Await Confirmation', description: 'CHAIN::PENDING...' },
                    { title: 'Completed', description: 'STATUS::COMPLETE' }
                ]);
                setCurrentProgressStep(0);
                setShowProgressModal(true);
            }

            // Call ZK proof API
            const zkResponse = await fetch(ENDPOINTS.PROOF.RECEIPT_DATA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential_type: 'wallet',
                    data: {
                        address: walletAccount,
                        balance_wei: ethers.utils.parseEther(balance).toString(),
                        transaction_count: txCount,
                        chain_id: 11155111,
                        signature: signature,
                        message: message
                    },
                    recipient: walletAccount
                })
            });

            const zkData = await zkResponse.json();

            if (!zkResponse.ok || zkData.status === 'error') {
                throw new Error(zkData.message || 'ZK proof generation failed');
            }

            const zkProof = {
                proofId: zkData.proofId || `zk - wallet - ${Date.now()} `,
                receipt: zkData.receipt_hex || zkData.receipt,
                journal: zkData.journal_hex || zkData.journal,
                imageId: zkData.image_id_hex || zkData.imageId,
                nullifier: zkData.nullifier_hex || zkData.nullifier,
                timestamp: zkData.timestamp || Date.now(),
                verified: true
            };

            // Trigger minting
            if (mintCredential) {
                await new Promise(r => setTimeout(r, 500));
                const success = await mintCredential(zkProof, CREDENTIAL_TYPE.WALLET, true);
                if (success) {
                    setStatus('minted');
                } else {
                    setStatus('error');
                    setError('Minting failed');
                }
            }
        } catch (err) {
            console.error('Mint error:', err);
            setStatus('error');
            setError(err.message || 'Failed to generate proof');
        }
    };

    // Verified/Minted State
    if (status === 'success' || status === 'generating_proof' || status === 'minted') {
        const isMinted = status === 'minted';
        const statusColor = isMinted ? 'emerald' : 'cyan';

        return (
            <div className="space-y-4">
                {/* Header with status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w - 10 h - 10 rounded - xl flex - shrink - 0 flex items - center justify - center
bg - gradient - to - br ${isMinted ? 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30' : 'from-cyan-500/20 to-purple-500/20 border-cyan-500/30'} 
                                       border shadow - [0_0_20px_rgba(${isMinted ? '16,185,129' : '0,255,255'}, 0.2)]`}>
                            <EthereumIcon size={24} className={isMinted ? 'text-emerald-400' : 'text-cyan-400'} />
                        </div>
                        <div>
                            <div className="font-bold text-theme-text-primary text-sm tracking-tight">On-Chain Assets</div>
                            <div className="text-xs text-theme-text-muted font-medium">
                                {walletAccount?.slice(0, 6)}...{walletAccount?.slice(-4)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className={`text - base font - bold tracking - tight ${isMinted ? 'text-emerald-400' : 'text-cyan-400'} `}>
                                {balance} ETH
                            </div>
                        </div>
                        <div className={`flex items - center gap - 1 px - 3 py - 1.5 rounded - lg text - xs font - bold tracking - wider
                                       ${isMinted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                            } `}>
                            <CheckCircle size={14} />
                            <span>{isMinted ? 'MINTED' : 'VERIFIED'}</span>
                        </div>
                    </div>
                </div>

                {/* TX count info */}
                <div className="flex items-center justify-between py-2 px-3 bg-surface-elevated-2 rounded-lg border border-theme-border-medium">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-theme-text-muted uppercase">
                        <Info size={14} className="text-theme-text-muted" />
                        <span>Transaction History</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-theme-text-primary">{txCount} TX</span>
                        <span className={`text - xs px - 2 py - 0.5 rounded - full font - bold ${txCount >= REQUIRED_TX_COUNT
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-surface-elevated-3 text-theme-text-muted border border-theme-border-medium'
                            } `}>
                            {txCount >= REQUIRED_TX_COUNT ? '10+' : '<10'}
                        </span>
                    </div>
                </div>

                {/* Mint Button */}
                {status !== 'minted' && (
                    <button
                        onClick={handleMint}
                        disabled={status === 'generating_proof'}
                        className="w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase
                                 bg-gradient-to-r from-cyan-500 to-purple-500 text-white
                                 shadow-[0_0_30px_rgba(0,255,255,0.3)]
                                 hover:shadow-[0_0_40px_rgba(0,255,255,0.5)]
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-300 cursor-pointer
                                 flex items-center justify-center gap-2"
                    >
                        {status === 'generating_proof' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-white">Generating Proof...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                <span>Mint Credential</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    }

    // Connect/Verify State
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center 
                              bg-surface-elevated-2 border border-theme-border-medium">
                    <EthereumIcon size={24} className="text-theme-text-muted" />
                </div>
                <div>
                    <div className="font-bold text-theme-text-primary text-sm tracking-tight">On-Chain Assets</div>
                    <div className="text-xs text-theme-text-muted font-medium tracking-wider uppercase">
                        {walletAccount ? 'Ready to Verify' : 'Connect Wallet'}
                    </div>
                </div>
            </div>

            {!walletAccount ? (
                <button
                    onClick={handleConnect}
                    className="px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase
                             bg-gradient-to-r from-cyan-500 to-purple-500 text-white
                             shadow-[0_0_20px_rgba(0,255,255,0.3)]
                             hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
                             transition-all duration-300 cursor-pointer
                             flex items-center gap-2"
                >
                    <Zap size={14} />
                    Connect
                </button>
            ) : (
                <button
                    onClick={handleVerify}
                    disabled={status === 'verifying'}
                    className="px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase
                             bg-cyan-500/20 border border-cyan-500/30 text-cyan-400
                             hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-300 cursor-pointer
                             flex items-center gap-2"
                >
                    {status === 'verifying' ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Signing...</span>
                        </>
                    ) : status === 'error' ? (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            <span>RETRY</span>
                        </>
                    ) : (
                        <span>Verify</span>
                    )}
                </button>
            )}
        </div>
    );
};

export default CryptoPortfolio;
