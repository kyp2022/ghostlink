import { useState } from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID } from '../config/constants';

// Helper: Wait for ethers.js to be ready
const waitForEthers = () => Promise.resolve(ethers);

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const connectWallet = async () => {
        try {
            await waitForEthers();
        } catch (error) {
            alert('Failed to load ethers.js. Please refresh the page and try again.');
            console.error('ethers.js loading error:', error);
            return false;
        }

        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask is not detected. Please install the MetaMask extension.');
            return false;
        }

        // Handle multiple wallet providers
        let ethereum = window.ethereum;
        if (window.ethereum.providers && Array.isArray(window.ethereum.providers) && window.ethereum.providers.length > 0) {
            ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
        }

        setIsConnecting(true);
        try {
            // Request account access
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No wallet account authorized.');
            }

            // Check network
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            const targetChainId = '0x' + CHAIN_ID.toString(16);

            if (chainId !== targetChainId) {
                try {
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: targetChainId }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: targetChainId,
                                chainName: 'Sepolia Testnet',
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                }
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            const ethersProvider = new ethers.providers.Web3Provider(ethereum);
            const ethersSigner = ethersProvider.getSigner();

            setAccount(accounts[0]);
            setProvider(ethersProvider);
            setSigner(ethersSigner);

            // Listen for account changes
            ethereum.on('accountsChanged', (newAccounts) => {
                if (newAccounts.length === 0) {
                    setAccount(null);
                    setProvider(null);
                    setSigner(null);
                } else {
                    setAccount(newAccounts[0]);
                    const newProvider = new ethers.providers.Web3Provider(ethereum);
                    setProvider(newProvider);
                    setSigner(newProvider.getSigner());
                }
            });

            // Listen for network changes
            ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            return true;
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('Wallet connection failed: ' + error.message);
            return false;
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        console.log('Wallet disconnected');
    };

    return { account, provider, signer, isConnecting, connectWallet, disconnectWallet };
};
