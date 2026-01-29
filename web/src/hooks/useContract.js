import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/constants';

export const useContract = (signer, account) => {
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState(null);
    const [progressSteps, setProgressSteps] = useState([]);
    const [currentProgressStep, setCurrentProgressStep] = useState(0);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressTitle, setProgressTitle] = useState('Progress');

    const defaultProgressSteps = [
        { title: 'Generate ZK Proof', description: 'Prover is running… this may take a few minutes.' },
        { title: 'Prepare Transaction', description: 'Preparing contract parameters…' },
        { title: 'Confirm in Wallet', description: 'Please confirm in your wallet.' },
        { title: 'Await Confirmation', description: 'Waiting for on-chain confirmation…' },
        { title: 'Completed', description: 'Done.' }
    ];
    const TOTAL_STEPS = defaultProgressSteps.length;

    const ensureProgressInitialized = (titleOverride) => {
        setProgressTitle(titleOverride || 'Progress');
        setProgressSteps(prev => (prev && prev.length > 0 ? prev : defaultProgressSteps));
    };

    const mintCredential = async (zkProof, credentialType, autoStart = false) => {
        if (!signer || !account) {
            alert('Please connect your wallet first.');
            return false;
        }

        if (!zkProof) {
            alert('Missing zero-knowledge proof data.');
            return false;
        }

        setIsMinting(true);
        ensureProgressInitialized('Proof → Mint');

        if (autoStart) {
            setShowProgressModal(true);
        }

        try {
            // Mark proof step as completed
            setProgressSteps(prev => prev.map((s, i) =>
                i === 0 ? { ...s, description: 'Proof ready', details: `Proof ID: ${zkProof.proofId || 'N/A'}` } : s
            ));

            // Step 2: Prepare transaction
            setCurrentProgressStep(1);
            setProgressSteps(prev => prev.map((s, i) =>
                i === 1 ? { ...s, description: 'Transaction parameters ready' } : s
            ));

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Prepare seal
            let seal;
            if (zkProof.receipt) {
                seal = typeof zkProof.receipt === 'string' ? zkProof.receipt : String(zkProof.receipt);
                if (!seal.startsWith('0x')) {
                    seal = '0x' + seal;
                }
                if (!seal || seal.length < 10) {
                    throw new Error('Invalid seal format');
                }
            } else {
                throw new Error('Missing receipt in zkProof');
            }

            // Prepare nullifier
            let nullifier;
            if (zkProof.nullifier) {
                nullifier = typeof zkProof.nullifier === 'string' ? zkProof.nullifier : String(zkProof.nullifier);
                if (nullifier.startsWith('0x')) {
                    nullifier = nullifier.substring(2);
                }
                if (nullifier.length !== 64) {
                    throw new Error(`Invalid nullifier length: expected 64 hex chars, got ${nullifier.length}`);
                }
                if (!/^[0-9a-fA-F]{64}$/.test(nullifier)) {
                    throw new Error(`Invalid nullifier format: must be 64 hex characters`);
                }
                nullifier = '0x' + nullifier;
                nullifier = ethers.utils.hexlify(nullifier);
            } else {
                throw new Error('Missing nullifier in zkProof');
            }

            // Check nullifier usage
            try {
                const nullifierUsed = await contract.functions.nullifiers(nullifier);
                const isUsed = nullifierUsed === true || nullifierUsed === 1 ||
                    nullifierUsed === 'true' || String(nullifierUsed).toLowerCase() === 'true';
                if (isUsed) {
                    throw new Error('This proof has already been used! Please generate a new proof.');
                }
            } catch (nullifierError) {
                if (nullifierError.message?.includes('already been used')) {
                    throw nullifierError;
                }
                console.warn('Nullifier check failed (non-critical):', nullifierError.message);
            }

            // Prepare credential type (default to 0 if not provided)
            const credType = credentialType !== undefined ? credentialType : 0;
            if (credType < 0 || credType > 3) {
                throw new Error('Invalid credential type. Must be 0-3 (0: GitHub, 1: Alipay, 2: Twitter, 3: Wallet)');
            }

            // Step 3: Submit transaction
            setCurrentProgressStep(2);
            setProgressSteps(prev => prev.map((s, i) =>
                i === 2 ? { ...s, description: 'Please confirm in your wallet' } : s
            ));
            setMintStatus({ type: 'pending', message: 'Waiting for wallet confirmation...' });

            // Simulate transaction (new interface: seal, nullifier, credType)
            try {
                await contract.callStatic.mint(seal, nullifier, credType);
            } catch (simError) {
                const errorMsg = simError.reason || simError.message || 'Transaction simulation failed';
                throw new Error(`Transaction will fail: ${errorMsg}`);
            }

            // Estimate gas
            let gasEstimate;
            try {
                gasEstimate = await contract.estimateGas.mint(seal, nullifier, credType);
            } catch {
                gasEstimate = ethers.BigNumber.from('500000');
            }

            // Execute transaction (new interface: seal, nullifier, credType)
            const tx = await contract.mint(seal, nullifier, credType, {
                gasLimit: gasEstimate.mul(120).div(100)
            });

            // Step 4: Wait for confirmation
            setCurrentProgressStep(3);
            setProgressSteps(prev => prev.map((s, i) =>
                i === 3 ? {
                    ...s,
                    description: 'Transaction submitted, waiting for confirmation...',
                    details: `Tx hash: ${tx.hash.substring(0, 10)}...`
                } : s
            ));
            setMintStatus({ type: 'pending', message: 'Transaction submitted...', txHash: tx.hash });

            const receipt = await tx.wait();

            // Step 5: Complete
            setCurrentProgressStep(TOTAL_STEPS);
            setProgressSteps(prev => prev.map((s, i) =>
                i === 4 ? {
                    ...s,
                    description: 'Credential minted successfully.',
                    details: `Block: ${receipt.blockNumber} · Tx: ${receipt.transactionHash.substring(0, 10)}...`
                } : s
            ));
            setMintStatus({
                type: 'success',
                message: 'Credential minted successfully.',
                txHash: receipt.transactionHash
            });

            return true;
        } catch (error) {
            console.error('Minting failed:', error);
            let errorMessage = 'Transaction failed.';
            if (error.code === 4001) {
                errorMessage = 'User rejected the transaction.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMintStatus({ type: 'error', message: errorMessage });
            setProgressSteps(prev => prev.map((s, i) =>
                i === currentProgressStep ? { ...s, description: `Failed: ${errorMessage}` } : s
            ));
            // Don't advance to TOTAL_STEPS - stay at the failed step
            // setCurrentProgressStep(TOTAL_STEPS); // REMOVED
            return false;
        } finally {
            setIsMinting(false);
        }
    };

    return {
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
    };
};
