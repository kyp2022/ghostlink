import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';

/**
 * LayoutShell - Master layout wrapper for bifurcated UI
 * 
 * Dark Mode: Traditional full-width body with top navbar
 * Light Mode: CSS Grid with fixed left sidebar + main content area
 */
export const LayoutShell = ({
    children,
    topNavbar,
    sideNavbar,
    footer
}) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const { t } = useI18n();

    // Dark Mode Layout - Traditional vertical stack
    if (!isLight) {
        return (
            <div className="min-h-screen bg-surface-base flex flex-col">
                {topNavbar}
                <div className="flex-1">
                    {children}
                </div>
                {footer}
            </div>
        );
    }

    // Light Mode Layout - Sidebar + Content Grid
    return (
        <div className="min-h-screen bg-surface-base bg-blueprint-grid">
            {/* Fixed Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-50">
                {sideNavbar}
            </aside>

            {/* Main Content Area - Offset by sidebar width */}
            <div className="ml-[280px] min-h-screen flex flex-col">
                {/* Top Header Bar (contextual actions, wallet, etc.) */}
                <header className="sticky top-0 z-40 bg-surface-base/95 backdrop-blur-sm border-b border-border-medium">
                    <div className="h-16 px-8 flex items-center justify-end gap-4">
                        {/* Wallet and theme toggle will be passed as slot content */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>

                {/* Footer - Simplified for sidebar layout */}
                <footer className="border-t border-border-medium px-8 py-6">
                    <div className="flex items-center justify-between text-xs text-text-muted font-mono">
                        <span>{t('footer.rights')}</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            {t('footer.network')}
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LayoutShell;
