import { Sun, Moon, Zap, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import LanguageToggle from '../ui/LanguageToggle';

const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const LightHeader = ({ account, onConnectWallet, disconnectWallet, isConnecting }) => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useI18n();

    return (
        <div className="w-full h-16 px-8 flex items-center justify-end gap-3">
            <LanguageToggle
                variant="pill"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            />

            <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
            >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="text-sm font-medium">{theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}</span>
            </button>

            {account ? (
                <>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-sm font-mono">{formatAddress(account)}</span>
                    </div>
                    <button
                        onClick={() => disconnectWallet?.()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                        title={t('wallet.disconnect')}
                    >
                        <LogOut size={16} className="text-slate-500" />
                        <span className="text-sm font-semibold">{t('wallet.disconnect')}</span>
                    </button>
                </>
            ) : (
                <button
                    onClick={onConnectWallet}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white shadow-physical-1 hover:shadow-physical-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Zap size={16} className="text-amber-400" />
                    <span className="text-sm font-semibold">{isConnecting ? t('wallet.connecting') : t('wallet.connect')}</span>
                </button>
            )}
        </div>
    );
};

export default LightHeader;
