import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';

export const WalletButton = ({ account, connectWallet, disconnectWallet, isConnecting }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className="relative">
            {!account ? (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/10 disabled:opacity-50"
                >
                    {isConnecting ? '连接中...' : 'Connect Wallet'}
                </button>
            ) : (
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-mono">{formatAddress(account)}</span>
                    <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
            )}

            {account && showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    disconnectWallet();
                                    setShowDropdown(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={14} />
                                <span>Disconnect</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
