import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from './hooks/useWallet';
import { useTheme } from './contexts/ThemeContext';
import { LayoutShell } from './components/layout/LayoutShell';
import { Navbar } from './components/layout/Navbar';
import { SideNavbar } from './components/layout/SideNavbar';
import { Footer } from './components/layout/Footer';
import { LensFlareTransition } from './components/ui/LensFlareTransition';
import { HomePage } from './pages/HomePage';
import { SolutionsPage } from './pages/SolutionsPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { DevelopersPage } from './pages/DevelopersPage';
import { CompanyPage } from './pages/CompanyPage';
import { GITHUB_CLIENT_ID, TWITTER_CLIENT_ID, REDIRECT_URI } from './config/constants';
import { ENDPOINTS } from './config/endpoints';

function App() {
    // Theme context for bifurcated layout
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // Persist activeTab across refreshes
    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem('ghostlink_active_tab');
        return saved || 'home';
    });

    // Save to localStorage whenever activeTab changes
    useEffect(() => {
        localStorage.setItem('ghostlink_active_tab', activeTab);
    }, [activeTab]);

    const [verificationStatus, setVerificationStatus] = useState('idle');
    const [userData, setUserData] = useState(null);
    const [zkProof, setZkProof] = useState(null);

    // Twitter State
    const [twitterStatus, setTwitterStatus] = useState('idle');
    const [twitterUser, setTwitterUser] = useState(null);
    const [twitterProof, setTwitterProof] = useState(null);

    // Wallet State
    const { account, signer, connectWallet, disconnectWallet, isConnecting } = useWallet();

    // Handle Popup Logic & Message Listener
    useEffect(() => {
        // 1. If we are the popup (child window)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && window.opener) {
            let authType = 'GITHUB_AUTH_CODE';
            if (state === 'twitter') authType = 'TWITTER_AUTH_CODE';

            window.opener.postMessage({
                type: authType,
                code: code
            }, window.location.origin);
            window.close();
            return;
        }

        // 2. If we are the main window (parent)
        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return;

            // Prevent strict mode double-firing
            if (verificationStatus === 'loading' || twitterStatus === 'loading') return;

            if (event.data.type === 'GITHUB_AUTH_CODE') {
                handleGithubCallback(event.data.code);
            } else if (event.data.type === 'TWITTER_AUTH_CODE') {
                handleTwitterCallback(event.data.code);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [verificationStatus, twitterStatus]); // Add deps to ensure latest state is checked

    const handleGithubCallback = async (code) => {
        setActiveTab('solutions');
        setVerificationStatus('loading');

        let recipient = account;
        if (!recipient && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    recipient = accounts[0];
                }
            } catch (e) {
                console.error('Failed to get accounts:', e);
            }
        }

        if (!recipient) {
            console.error("Wallet not connected. Please connect wallet first.");
            setVerificationStatus('error');
            alert('请先连接钱包！');
            return;
        }

        fetch(ENDPOINTS.AUTH.GITHUB_CALLBACK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                recipient,
                redirectUri: REDIRECT_URI // Send redirect_uri to backend
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error("Auth error:", data.error);
                    setVerificationStatus('error');
                } else {
                    setUserData(data.user);
                    setZkProof(data.zkProof);
                    setVerificationStatus('success');
                }
            })
            .catch(err => {
                console.error("Network error:", err);
                setVerificationStatus('error');
            });
    };

    const handleTwitterCallback = async (code) => {
        setActiveTab('solutions');
        setTwitterStatus('loading');

        const codeVerifier = sessionStorage.getItem('twitter_code_verifier');

        let recipient = account;
        if (!recipient && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    recipient = accounts[0];
                }
            } catch (e) {
                console.error('Failed to get accounts:', e);
            }
        }

        if (!recipient) {
            console.error("Wallet not connected.");
            setTwitterStatus('error');
            alert('请先连接钱包！');
            return;
        }

        fetch(ENDPOINTS.AUTH.TWITTER_CALLBACK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                redirectUri: REDIRECT_URI,
                codeVerifier: codeVerifier,
                recipient: recipient
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) setTwitterStatus('error');
                else { setTwitterUser(data.user); setTwitterProof(data.zkProof); setTwitterStatus('success'); }
            })
            .catch(() => setTwitterStatus('error'));
    };



    const onGithubConnect = async () => {
        let currentAccount = account;
        if (!currentAccount) {
            const connected = await connectWallet();
            if (!connected) return;
            await new Promise(resolve => setTimeout(resolve, 500));

            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0) {
                        currentAccount = accounts[0];
                    }
                } catch (e) {
                    console.error('Failed to get accounts:', e);
                }
            }

            if (!currentAccount) {
                alert('Failed to connect wallet. Please try again.');
                return;
            }
        }

        if (!GITHUB_CLIENT_ID) {
            alert("Configuration error: please set your GitHub Client ID.");
            return;
        }
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user`;
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(authUrl, 'GitHub Auth', `width=${width},height=${height},top=${top},left=${left}`);
    };

    const onTwitterConnect = async () => {
        let currentAccount = account;
        if (!currentAccount) {
            const connected = await connectWallet();
            if (!connected) return;
            await new Promise(resolve => setTimeout(resolve, 500));

            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0) {
                        currentAccount = accounts[0];
                    }
                } catch (e) {
                    console.error('Failed to get accounts:', e);
                }
            }

            if (!currentAccount) {
                alert('Failed to connect wallet. Please try again.');
                return;
            }
        }

        if (!TWITTER_CLIENT_ID) { alert("Configuration error: please set TWITTER_CLIENT_ID."); return; }

        // PKCE Flow
        const generateRandomString = (length) => {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return result;
        };

        const sha256 = async (plain) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(plain);
            return window.crypto.subtle.digest('SHA-256', data);
        };

        const base64urlencode = (a) => {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
                .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        };

        const codeVerifier = generateRandomString(64);
        sessionStorage.setItem('twitter_code_verifier', codeVerifier);

        const codeChallengeBuffer = await sha256(codeVerifier);
        const codeChallenge = base64urlencode(codeChallengeBuffer);

        const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=users.read%20tweet.read&state=twitter&code_challenge=${codeChallenge}&code_challenge_method=S256`;

        window.open(authUrl, 'Twitter Auth', 'width=600,height=700');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'solutions':
                return <SolutionsPage
                    initialVerificationStatus={verificationStatus}
                    initialUserData={userData}
                    initialZkProof={zkProof}
                    onGithubConnect={onGithubConnect}
                    twitterStatus={twitterStatus}
                    twitterUser={twitterUser}
                    twitterProof={twitterProof}
                    onTwitterConnect={onTwitterConnect}
                    walletAccount={account}
                    walletSigner={signer}
                    onConnectWallet={connectWallet}
                />;
            case 'explorer': return <ExplorerPage walletSigner={signer} />;
            case 'developers': return <DevelopersPage />;
            case 'company': return <CompanyPage />;
            default: return <HomePage
                onConnectWallet={connectWallet}
                onViewDemo={() => setActiveTab('solutions')}
            />;
        }
    };

    // Bifurcated Layout Rendering
    return (
        <LayoutShell
            topNavbar={
                <Navbar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    account={account}
                    onConnectWallet={connectWallet}
                    disconnectWallet={disconnectWallet}
                    isConnecting={isConnecting}
                />
            }
            sideNavbar={
                <SideNavbar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    account={account}
                    onConnectWallet={connectWallet}
                />
            }
            footer={<Footer />}
        >
            {/* Only show lens flare in dark mode */}
            {!isLight && <LensFlareTransition />}

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: isLight ? 0 : 10, x: isLight ? 20 : 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: isLight ? 0 : -10, x: isLight ? -20 : 0 }}
                    transition={{ duration: isLight ? 0.2 : 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </LayoutShell>
    );
}

export default App;
