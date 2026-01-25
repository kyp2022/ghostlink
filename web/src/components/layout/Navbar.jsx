import { Ghost } from 'lucide-react';
import { WalletButton } from '../WalletButton';

export const Navbar = ({ activeTab, setActiveTab, account, connectWallet, disconnectWallet, isConnecting }) => {
    const tabs = [
        { id: 'home', label: 'Home' },
        { id: 'solutions', label: 'Solutions' },
        { id: 'explorer', label: 'Explorer' },
        { id: 'developers', label: 'Developers' },
        { id: 'company', label: 'Company' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setActiveTab('home')}
                >
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <Ghost size={18} />
                    </div>
                    <span className="font-semibold text-lg tracking-tight">GhostLink</span>
                </div>

                <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white text-black shadow-sm'
                                : 'text-text-muted hover:text-black'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <WalletButton
                    account={account}
                    connectWallet={connectWallet}
                    disconnectWallet={disconnectWallet}
                    isConnecting={isConnecting}
                />
            </div>
        </nav>
    );
};
