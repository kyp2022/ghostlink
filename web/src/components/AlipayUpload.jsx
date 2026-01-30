import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, Zap, X } from 'lucide-react';
import { API_BASE_URL, CREDENTIAL_TYPE } from '../config/constants';
import { AlipayIcon } from './ui/Icons';



const AlipayUpload = ({
    walletAccount,
    mintCredential,
    setShowProgressModal,
    setProgressSteps,
    setCurrentProgressStep,
    setProgressTitle,
    defaultProgressSteps,
    onVerificationComplete
}) => {
    const [status, setStatus] = useState('idle'); // idle, uploading, success, generating_proof, minted, error
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            if (droppedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            setFile(droppedFile);
            setError('');
        }
    };

    const handleVerify = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setStatus('uploading');
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            // Don't send recipient - just verify

            const response = await fetch(`${API_BASE_URL}/api/assets/upload/alipay`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || 'Verification failed');
            }

            setResult(data);
            setStatus('success');

            if (onVerificationComplete) {
                onVerificationComplete({
                    provider: 'alipay',
                    verified: true,
                    asset_amount: data.asset_amount,
                    id_number_hash: data.id_number_hash
                });
            }
        } catch (err) {
            console.error('Verification error:', err);
            setStatus('error');
            setError(err.message || 'Upload failed');
        }
    };

    const handleMint = async () => {
        if (!walletAccount) {
            setError('Please connect wallet first');
            return;
        }

        setStatus('generating_proof');
        setError('');

        try {
            // Initialize progress modal
            if (setProgressTitle && setProgressSteps && setCurrentProgressStep && setShowProgressModal) {
                setProgressTitle('ALIPAY · ZK_PROOF → MINT');
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
            const payload = {
                credential_type: 'alipay',
                data: {
                    balance: result.asset_amount,
                    id_number_hash: result.id_number_hash,
                    threshold: '10000'
                },
                recipient: walletAccount
            };

            const zkResponse = await fetch('http://127.0.0.1:3000/api/v1/prove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const zkData = await zkResponse.json();

            if (!zkResponse.ok || zkData.status === 'error') {
                throw new Error(zkData.message || 'ZK proof generation failed');
            }

            const zkProof = {
                proofId: zkData.proofId || `zk-alipay-${Date.now()}`,
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
                const success = await mintCredential(zkProof, CREDENTIAL_TYPE.ALIPAY, true);
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

    const clearFile = () => {
        setFile(null);
        setStatus('idle');
        setResult(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Verified/Minted State
    if (status === 'success' || status === 'generating_proof' || status === 'minted') {
        const isMinted = status === 'minted';

        return (
            <div className="space-y-4">
                {/* Header with status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center 
                                       bg-gradient-to-br ${isMinted ? 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30' : 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'} 
                                       border shadow-[0_0_20px_rgba(${isMinted ? '16,185,129' : '59,130,246'},0.2)]`}>
                            <AlipayIcon size={24} className={isMinted ? 'text-emerald-400' : 'text-blue-400'} />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm tracking-tight">Alipay Assets</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wider">
                                {result?.asset_amount || '0.00'} CNY
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className={`text-base font-bold tracking-tight ${isMinted ? 'text-emerald-400' : 'text-blue-400'}`}>
                                ¥{result?.asset_amount}
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider
                                       ${isMinted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                            }`}>
                            <CheckCircle size={10} />
                            <span>{isMinted ? 'MINTED' : 'VERIFIED'}</span>
                        </div>
                    </div>
                </div>

                {/* Mint Button */}
                {status !== 'minted' && (
                    <button
                        onClick={handleMint}
                        disabled={status === 'generating_proof' || !walletAccount}
                        className="w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase
                                 bg-gradient-to-r from-cyan-500 to-purple-500 text-white
                                 shadow-[0_0_30px_rgba(59,130,246,0.3)]
                                 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-300 cursor-pointer
                                 flex items-center justify-center gap-2"
                    >
                        {status === 'generating_proof' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating Proof...</span>
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

    // Upload State
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center 
                                  bg-blue-500/10 border border-blue-500/30">
                        <AlipayIcon size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm tracking-tight">Alipay Assets</div>
                        <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">Upload PDF Statement</div>
                    </div>
                </div>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                          transition-all duration-300
                          ${file
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-slate-600 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {file ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText size={24} className="text-blue-400" />
                            <div className="text-left">
                                <p className="text-xs text-white font-bold tracking-tight truncate max-w-[180px]">{file.name}</p>
                                <p className="text-xs text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
                        >
                            <X size={16} className="text-slate-400" />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Drop PDF Here</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">or click to browse</p>
                    </>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            {/* Verify button */}
            {file && (
                <button
                    onClick={handleVerify}
                    disabled={status === 'uploading'}
                    className="w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase
                             bg-gradient-to-r from-blue-500 to-cyan-500 text-white
                             hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-300 cursor-pointer
                             flex items-center justify-center gap-2"
                >
                    {status === 'uploading' ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <span>Verify Statement</span>
                    )}
                </button>
            )}
        </div>
    );
};

export default AlipayUpload;
