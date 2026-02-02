import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLocale, setLocale as persistLocale, t as translate, LOCALES } from '../i18n/strings';

const I18nContext = createContext({
    locale: LOCALES.EN,
    setLocale: () => { },
    t: (key, params) => translate(key, params),
});

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
};

export const I18nProvider = ({ children }) => {
    const [locale, setLocaleState] = useState(() => getLocale());

    useEffect(() => {
        persistLocale(locale);
        document.documentElement.lang = locale === LOCALES.ZH ? 'zh-CN' : 'en';
    }, [locale]);

    const value = useMemo(() => ({
        locale,
        setLocale: (next) => setLocaleState(next),
        t: (key, params) => translate(key, params, locale),
    }), [locale]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

