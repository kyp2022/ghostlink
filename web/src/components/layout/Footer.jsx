import { Ghost } from 'lucide-react';

export const Footer = () => (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white">
                        <Ghost size={14} />
                    </div>
                    <span className="font-bold">GhostLink</span>
                </div>
                <p className="text-sm text-text-muted">© 2026 GhostLink Labs.</p>
            </div>
            {['Product', 'Resources', 'Company'].map((col) => (
                <div key={col}>
                    <h4 className="font-semibold mb-4 text-sm">{col}</h4>
                    <ul className="space-y-2 text-sm text-text-muted">
                        <li>Overview</li>
                        <li>Documentation</li>
                        <li>Status</li>
                    </ul>
                </div>
            ))}
        </div>
    </footer>
);
