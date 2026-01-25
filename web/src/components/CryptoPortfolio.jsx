import React, { useState } from 'react';
import { CheckCircle, Loader, AlertCircle, Info } from 'lucide-react';
import { ethers } from 'ethers';

// Import wallet image
import walletIcon from '../../image/qianbao.png';

const CryptoPortfolio = ({ walletAccount, walletSigner, onVerificationComplete, onConnectWallet }) => {
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error
    const [balance, setBalance] = useState('0.00');
    const [txCount, setTxCount] = useState(0);
    const [error, setError] = useState('');

    const REQUIRED_TX_COUNT = 10;

    const handleVerify = async () => {
        console.log('=== CryptoPortfolio: Starting verification ===');

        if (!walletAccount || !walletSigner) {
            alert('Please connect your wallet first!');
            return;
        }

        setStatus('verifying');
        setError('');

        try {
            // 1. Request Ownership Signature
            const message = `GhostLink Asset-Pass Verification\n\nI confirm ownership of this wallet.\n\nAddress: ${walletAccount}\nTimestamp: ${Date.now()}`;

            console.log('Requesting signature...');
            const signature = await walletSigner.signMessage(message);
            console.log('Signature obtained');

            // 2. Get provider and fetch data
            const provider = walletSigner.provider;
            if (!provider) throw new Error('Provider not available');

            // 3. Fetch Balance
            const balanceWei = await provider.getBalance(walletAccount);
            const balanceEth = ethers.utils.formatEther(balanceWei);
            const formattedBalance = parseFloat(balanceEth).toFixed(4);
            setBalance(formattedBalance);

            // 4. Fetch Transaction Count
            const transactionCount = await provider.getTransactionCount(walletAccount);
            console.log('Transaction count:', transactionCount);
            setTxCount(transactionCount);

            // 5. Complete
            setStatus('success');

            if (onVerificationComplete) {
                onVerificationComplete({
                    provider: 'on-chain',
                    verified: true,
                    asset_amount: formattedBalance,
                    transaction_count: transactionCount,
                    has_10_plus_tx: transactionCount >= REQUIRED_TX_COUNT,
                    address: walletAccount,
                    signature: signature
                });
            }
        } catch (err) {
            console.error('Verification error:', err);
            setStatus('error');
            if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                setError('Signature rejected');
            } else {
                setError(err.message?.slice(0, 40) || 'Verification failed');
            }
        }
    };

    const handleConnect = () => {
        if (onConnectWallet) {
            onConnectWallet();
        }
    };

    // Render verified state
    if (status === 'success') {
        return (
            <div className="space-y-3">
                {/* Main info row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-indigo-50 p-2">
                            <img src={walletIcon} alt="Wallet" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">On-Chain Assets</div>
                            <div className="text-xs text-gray-500">
                                {walletAccount?.slice(0, 6)}...{walletAccount?.slice(-4)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-base font-bold text-gray-900 font-mono">{balance} ETH</div>
                        </div>
                        <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                            <CheckCircle size={12} />
                            <span>Verified</span>
                        </div>
                    </div>
                </div>

                {/* TX count info row */}
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info size={14} className="text-gray-400" />
                        <span>Transaction History</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium text-gray-900">{txCount} TX</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${txCount >= REQUIRED_TX_COUNT
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {txCount >= REQUIRED_TX_COUNT ? '≥10' : '<10'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Render connect/verify state
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-indigo-50 p-2">
                    <img src={walletIcon} alt="Wallet" className="w-full h-full object-contain" />
                </div>
                <div>
                    <div className="font-semibold text-gray-900">On-Chain Assets</div>
                    <div className="text-xs text-gray-500">
                        {walletAccount ? 'Verify wallet ownership' : 'Connect wallet to verify'}
                    </div>
                </div>
            </div>

            {!walletAccount ? (
                // Show Connect button when wallet not connected
                <button
                    onClick={handleConnect}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
                >
                    Connect
                </button>
            ) : (
                // Show Verify button when wallet is connected
                <button
                    onClick={handleVerify}
                    disabled={status === 'verifying'}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {status === 'verifying' ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Signing...</span>
                        </>
                    ) : status === 'error' ? (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Retry</span>
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
