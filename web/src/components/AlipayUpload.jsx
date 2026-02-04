import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Shield, Lock, Zap, X } from 'lucide-react';
import { CREDENTIAL_TYPE } from '../config/constants';
import { ENDPOINTS } from '../config/endpoints';
import { AlipayIcon } from './ui/Icons';
import { useI18n } from '../contexts/I18nContext';



const maskIdNumber = (value) => {
    if (!value) return null;
    const asString = String(value).trim();
    if (!asString || asString === 'Not Found') return null;

    const clean = asString.replace(/\s+/g, '');
    if (clean.length <= 7) return `${clean.slice(0, 1)}****${clean.slice(-1) || ''}`;

    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(-4);
    const maskLength = clean.length - prefix.length - suffix.length;
    const maskedMiddle = maskLength > 0 ? '*'.repeat(maskLength) : '*';
    return `${prefix}${maskedMiddle}${suffix}`;
};

const AlipayUpload = ({
    walletAccount,
    mintCredential,
    resetProgress,
    setShowProgressModal,
    setProgressSteps,
    setCurrentProgressStep,
    setProgressTitle,
    defaultProgressSteps,
    onVerificationComplete
}) => {
    const { t } = useI18n();
    const [status, setStatus] = useState('idle'); // idle, uploading, success, generating_proof, minted, error
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError(t('alipay.uploadPdfOnly'));
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
                setError(t('alipay.uploadPdfOnly'));
                return;
            }
            setFile(droppedFile);
            setError('');
        }
    };

    const handleVerify = async () => {
        if (!file) {
            setError(t('alipay.selectFileFirst'));
            return;
        }

        setStatus('uploading');
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            // Don't send recipient - just verify

            const response = await fetch(ENDPOINTS.ASSETS.UPLOAD_ALIPAY, {
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
            setError(err.message || t('alipay.uploadFailed'));
        }
    };

    const handleMint = async () => {
        if (!walletAccount) {
            setError(t('alipay.connectFirst'));
            return;
        }
        if (!result) {
            setError(t('alipay.selectFileFirst'));
            return;
        }

        setStatus('generating_proof');
        setError('');

        try {
            // Initialize progress modal with resetProgress to clear any previous mintStatus
            if (resetProgress && setShowProgressModal) {
                resetProgress(t('alipay.progressTitle'));
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

            const zkResponse = await fetch(ENDPOINTS.PROOF.RECEIPT_DATA, {
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
                    setError(t('alipay.mintFailed'));
                    // 保持在已验证视图中，方便用户重试
                    setStatus('success');
                }
            }
        } catch (err) {
            console.error('Mint error:', err);
            setError(err.message || t('alipay.proofFailed'));
            // 若已拿到验证结果，保持在已验证视图中，方便用户修正后重试
            setStatus(result ? 'success' : 'error');
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
                            <div className="font-bold text-theme-text-primary text-sm tracking-tight">{t('alipay.assets')}</div>
                            <div className="text-xs text-theme-text-muted font-medium tracking-wider">
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
                            <span>{isMinted ? t('alipay.minted') : t('alipay.verified')}</span>
                        </div>
                    </div>
                </div>

                {/* Mint Button */}
                {status !== 'minted' && (
                    <button
                        onClick={handleMint}
                        disabled={!result || status === 'generating_proof'}
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
                                <span>{t('common.generatingProof')}</span>
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                <span>{t('alipay.mint')}</span>
                            </>
                        )}
                    </button>
                )}

                {/* Error message (verified/mint flow) */}
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                        <AlertCircle size={14} />
                        <span className="break-words">{error}</span>
                    </div>
                )}
                <div className="pt-2">
                    <div className="text-[12px] font-mono uppercase tracking-widest text-theme-text-muted">
                        {t('alipay.idNumberLabel')}
                    </div>
                    <div className="text-sm font-mono font-semibold text-theme-text-primary">
                        {maskIdNumber(result?.id_number) || t('alipay.idNumberNotAvailable')}
                    </div>
                </div>
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
                        <div className="font-bold text-theme-text-primary text-sm tracking-tight">{t('alipay.assets')}</div>
                        <div className="text-xs text-theme-text-muted font-medium tracking-wider">{t('alipay.uploadPdf')}</div>
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
                        : 'border-theme-border-medium hover:border-theme-accent-primary/50 bg-surface-elevated-2 hover:bg-surface-elevated-3'
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
                                <p className="text-xs text-theme-text-primary font-bold tracking-tight truncate max-w-[180px]">{file.name}</p>
                                <p className="text-xs text-theme-text-muted font-medium">{(file.size / 1024).toFixed(1)} {t('common.kilobytes')}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="p-1 rounded-lg bg-surface-elevated-3 hover:bg-theme-border-medium transition-colors cursor-pointer"
                        >
                            <X size={16} className="text-theme-text-muted" />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload size={24} className="text-theme-text-muted mx-auto mb-2" />
                        <p className="text-xs font-bold text-theme-text-muted tracking-wider">{t('alipay.dropHere')}</p>
                        <p className="text-xs text-theme-text-muted font-medium mt-1">{t('alipay.clickBrowse')}</p>
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
                            <span>{t('alipay.verifying')}</span>
                        </>
                    ) : (
                        <span>{t('alipay.verifyStatement')}</span>
                    )}
                </button>
            )}
        </div>
    );
};

export default AlipayUpload;
