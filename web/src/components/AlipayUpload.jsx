import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

// Import Alipay image
import alipayIcon from '../../image/zhifubao.png';

const AlipayUpload = ({ onVerificationComplete }) => {
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

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            setStatus('verifying');

            const response = await fetch('http://localhost:8080/api/assets/upload/alipay', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setStatus('success');
                setResult(data);
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

    const resetUpload = () => {
        setFile(null);
        setStatus('idle');
        setError('');
        setResult(null);
    };

    // Render verified state
    if (status === 'success') {
        return (
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
