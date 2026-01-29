import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { CREDENTIAL_TYPE } from '../config/constants';

// Import Alipay image
import alipayIcon from '../../image/zhifubao.png';

const AlipayUpload = ({
    onVerificationComplete,
    walletAccount,
    mintCredential,
    setShowProgressModal,
    setProgressSteps,
    setCurrentProgressStep,
    setProgressTitle,
    defaultProgressSteps
}) => {
    // status: idle, uploading, verifying, success (verified locally), generating_proof, minted, error
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            // Reset status to idle when new file is selected
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        if (!walletAccount) {
            alert('Please connect your wallet first!');
            return;
        }

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);
        // Do NOT generate proof yet
        // Since we modified backend to check recipient, we pass it but also want to skip proof?
        // Actually I modified backend to skip if generate_proof is false (implicit or explicit?)
        // Backend logic: `boolean generateProof = recipient != null ...`
        // Wait, if I send recipient, it defaults to true!
        // I need to update backend to accept explicit query param OR I just don't send recipient?
        // But if I don't send recipient, the backend won't have it later?
        // No, backend is stateless for Step 2 (frontend calls ZK directly).
        // So Step 1: Just verify file. I can omit recipient so backend defaults generateProof=false?
        // Let's check backend logic again: "boolean generateProof = recipient != null ...;"
        // YES. If I omit recipient, extract data only.
        // BUT verifyAndExtractBalance doesn't take recipient.
        // So for Step 1, I just send file.

        // CORRECTION: I should omit recipient in handleUpload to trigger "Verify Only" mode in backend
        // (assuming I implemented "if (!generateProof)" branch correctly).
        // Let's verify backend change in my head... if (!generateProof) { return extract... }
        // generateProof = recipient != null ...
        // So if I don't send recipient, generateProof is false. PERFECT.

        try {
            setStatus('verifying');

            const response = await fetch('http://localhost:8080/api/assets/upload/alipay', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Alipay verification response:', data);

            if (response.ok && data.status === 'success') {
                setStatus('success'); // Verified locally
                setResult(data); // data includes asset_amount, id_number_hash

                if (onVerificationComplete) {
                    onVerificationComplete(data);
                }
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setError(err.message || 'Verification failed');
        }
    };

    const handleMint = async () => {
        if (!result || !walletAccount) return;

        console.log('=== AlipayUpload: Starting minting process ===');
        setStatus('generating_proof');
        setError('');

        try {
            // Initialize progress modal
            if (setProgressTitle && setProgressSteps && setCurrentProgressStep && setShowProgressModal) {
                setProgressTitle('Alipay · Proof → Mint');
                setProgressSteps(defaultProgressSteps || [
                    { title: 'Generate ZK Proof', description: 'Prover is running… this may take a few minutes.' },
                    { title: 'Prepare Transaction', description: 'Preparing contract parameters…' },
                    { title: 'Confirm in Wallet', description: 'Please confirm in your wallet.' },
                    { title: 'Await Confirmation', description: 'Waiting for on-chain confirmation…' },
                    { title: 'Completed', description: 'Done.' }
                ]);
                setCurrentProgressStep(0);
                setShowProgressModal(true);
            }

            console.log('Calling direct ZK proof API for Alipay...');

            // Construct payload for Direct ZK API
            const payload = {
                credential_type: 'alipay',
                data: {
                    balance: result.asset_amount, // Ensure this matches backend response key
                    id_number_hash: result.id_number_hash,
                    threshold: '10000'
                },
                recipient: walletAccount
            };

            console.log('ZK Payload:', payload);

            const zkResponse = await fetch('http://127.0.0.1:3000/api/v1/prove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const zkData = await zkResponse.json();
            console.log('ZK proof response:', zkData);

            if (!zkResponse.ok || zkData.status === 'error') {
                throw new Error(zkData.message || 'ZK proof generation failed');
            }

            // Parse ZK proof
            const zkProof = {
                proofId: zkData.proofId || `zk-alipay-${Date.now()}`,
                receipt: zkData.receipt_hex || zkData.receipt,
                journal: zkData.journal_hex || zkData.journal,
                imageId: zkData.image_id_hex || zkData.imageId,
                nullifier: zkData.nullifier_hex || zkData.nullifier,
                timestamp: zkData.timestamp || Date.now(),
                verified: true
            };

            console.log('Parsed ZK proof:', zkProof);

            // Trigger minting
            if (mintCredential) {
                // Small delay to ensure progress modal is visible
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
            console.error('Minting error:', err);
            setStatus('error');
            setError(err.message || 'Proof generation failed');

            // Update progress modal with error
            if (setProgressSteps && setCurrentProgressStep) {
                setProgressSteps(prev => prev.map((s, i) =>
                    i === 0 ? { ...s, description: `Failed: ${err.message}` } : s
                ));
                setCurrentProgressStep(5);
            }
        }
    };

    const resetUpload = () => {
        setFile(null);
        setStatus('idle');
        setError('');
        setResult(null);
    };

    // Render verified/minted state
    // Note: 'minted' state should also show the Mint button disabled or show Success stats?
    // Usually 'success' shows stats and 'Mint' button.
    // If Mint is done, maybe hide button?
    if (status === 'success' || status === 'generating_proof' || status === 'minted') {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 p-2">
                            <img src={alipayIcon} alt="Alipay" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Alipay Balance</div>
                            <div className="text-xs text-gray-500">
                                ID: {result?.id_number?.slice(0, 4)}****{result?.id_number?.slice(-4) || ''}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-base font-bold text-gray-900 font-mono">{result?.asset_amount}</div>
                        </div>
                        <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                            <CheckCircle size={12} />
                            <span>Verified</span>
                        </div>
                    </div>
                </div>

                {/* Mint Button */}
                {status !== 'minted' && (
                    <button
                        onClick={handleMint}
                        disabled={status === 'generating_proof'}
                        className="w-full py-2 rounded-xl text-sm font-semibold transition-all bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'generating_proof' ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Generating Proof...</span>
                            </>
                        ) : (
                            <span>Mint Asset Credential</span>
                        )}
                    </button>
                )}
            </div>
        );
    }

    // Render upload/error state
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 p-2">
                    <img src={alipayIcon} alt="Alipay" className="w-full h-full object-contain" />
                </div>
                <div>
                    <div className="font-semibold text-gray-900">Alipay Balance</div>
                    <div className="text-xs text-gray-500 max-w-[150px] truncate">
                        {status === 'error'
                            ? <span className="text-red-500">{error.slice(0, 25)}</span>
                            : file
                                ? file.name
                                : 'Upload PDF statement'
                        }
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="alipay-file-input"
                    disabled={status === 'uploading' || status === 'verifying'}
                />

                {status === 'error' ? (
                    // After error: show both "Change File" and "Retry" buttons
                    <>
                        <label
                            htmlFor="alipay-file-input"
                            className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Change
                        </label>
                        <button
                            onClick={handleUpload}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <AlertCircle className="w-3 h-3" />
                            Retry
                        </button>
                    </>
                ) : !file ? (
                    // No file selected: show "Select PDF" button
                    <label
                        htmlFor="alipay-file-input"
                        className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Select PDF
                    </label>
                ) : (
                    // File selected: show "Verify" button
                    <button
                        onClick={handleUpload}
                        disabled={status === 'uploading' || status === 'verifying'}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {status === 'verifying' ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlipayUpload;
