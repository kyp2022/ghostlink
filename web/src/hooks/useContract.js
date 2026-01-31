import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/constants';
import { t } from '../i18n/strings';

export const useContract = (signer, account) => {
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState(null);
    const [progressSteps, setProgressSteps] = useState([]);
    const [currentProgressStep, setCurrentProgressStep] = useState(0);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressTitle, setProgressTitle] = useState(t('modal.processing'));

    const defaultProgressSteps = [
        { title: t('progress.stepGenerate'), description: t('progress.descGenerate') },
        { title: t('progress.stepPrepare'), description: t('progress.descPrepare') },
        { title: t('progress.stepConfirm'), description: t('progress.descConfirm') },
        { title: t('progress.stepAwait'), description: t('progress.descAwait') },
        { title: t('progress.stepDone'), description: t('progress.descDone') }
    ];
    const TOTAL_STEPS = defaultProgressSteps.length;

    const ensureProgressInitialized = (titleOverride) => {
        setProgressTitle(titleOverride || t('modal.processing'));
        setProgressSteps(prev => (prev && prev.length > 0 ? prev : defaultProgressSteps));
    };

    const mintCredential = async (zkProof, credentialType, autoStart = false) => {
        if (!signer || !account) {
            alert(t('errors.connectWalletFirst'));
            return false;
        }

        if (!zkProof) {
            alert(t('errors.missingProof'));
            return false;
        }

        setIsMinting(true);
        ensureProgressInitialized(t('progress.proofToMint'));

        if (autoStart) {
            setShowProgressModal(true);
        }

        try {
            // Mark proof step as completed
            setProgressSteps(prev => prev.map((s, i) =>
                i === 0 ? { ...s, description: t('progress.proofReady'), details: `Proof ID: ${zkProof.proofId || 'N/A'}` } : s
            ));

            // Step 2: Prepare transaction
            setCurrentProgressStep(1);
            setProgressSteps(prev => prev.map((s, i) =>
                i === 1 ? { ...s, description: t('progress.txParamsReady') } : s
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
                i === 2 ? { ...s, description: t('progress.confirmInWallet') } : s
            ));
            setMintStatus({ type: 'pending', message: t('progress.waitingWallet') });

            // Simulate transaction (new interface: seal, nullifier, credType)
            try {
                await contract.callStatic.mint(seal, nullifier, credType);
            } catch (simError) {
                const errorMsg = simError.reason || simError.message || t('errors.transactionSimulationFailed');
                throw new Error(t('errors.transactionWillFail', { message: errorMsg }));
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
                    description: t('progress.txSubmittedWaiting'),
                    details: `Tx hash: ${tx.hash.substring(0, 10)}...`
                } : s
            ));
            setMintStatus({ type: 'pending', message: t('progress.txSubmitted'), txHash: tx.hash });

            const receipt = await tx.wait();

            // Step 5: Complete
            setCurrentProgressStep(TOTAL_STEPS);
            setProgressSteps(prev => prev.map((s, i) =>
                i === 4 ? {
                    ...s,
                    description: t('progress.mintedOk'),
                    details: `Block: ${receipt.blockNumber} · Tx: ${receipt.transactionHash.substring(0, 10)}...`
                } : s
            ));
            setMintStatus({
                type: 'success',
                message: t('progress.mintedOk'),
                txHash: receipt.transactionHash
            });

            return true;
        } catch (error) {
            console.error('Minting failed:', error);
            let errorMessage = t('errors.transactionFailed');
            if (error.code === 4001) {
                errorMessage = t('errors.userRejectedTx');
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMintStatus({ type: 'error', message: errorMessage });
            setProgressSteps(prev => prev.map((s, i) =>
                i === currentProgressStep ? { ...s, description: t('progress.failedPrefix', { message: errorMessage }) } : s
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
