import { Globe } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { LOCALES } from '../../i18n/strings';

export const LanguageToggle = ({ variant = 'pill', className = '' }) => {
    const { locale, setLocale, t } = useI18n();
    const isZh = locale === LOCALES.ZH;

    const toggle = () => setLocale(isZh ? LOCALES.EN : LOCALES.ZH);

    if (variant === 'icon') {
        return (
            <button
                onClick={toggle}
                className={className}
                aria-label={t('common.language')}
                title={t('common.language')}
            >
                <Globe size={18} />
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            className={className}
            aria-label={t('common.language')}
            title={t('common.language')}
        >
            <Globe size={16} />
            <span>{isZh ? t('common.english') : t('common.chinese')}</span>
        </button>
    );
};

export default LanguageToggle;

