import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderOpen, FileCode2, ShieldCheck, ExternalLink, Copy, Check, Download, Info } from 'lucide-react';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

const FILES = [
    {
        id: 'GhostLinkSBT',
        label: 'GhostLinkSBT.sol',
        treePath: 'contracts/GhostLinkSBT.sol',
        url: '/contracts/GhostLinkSBT.sol',
    },
    {
        id: 'IRiscZeroVerifier',
        label: 'IRiscZeroVerifier.sol',
        treePath: 'contracts/IRiscZeroVerifier.sol',
        url: '/contracts/IRiscZeroVerifier.sol',
    },
];

const SOL_KEYWORDS = new Set([
    'pragma', 'solidity', 'import', 'from', 'as', 'using',
    'contract', 'interface', 'library', 'struct', 'enum', 'event',
    'constructor', 'function', 'returns', 'return', 'modifier',
    'mapping', 'address', 'bool', 'string', 'bytes', 'calldata', 'memory', 'storage',
    'public', 'private', 'internal', 'external', 'view', 'pure', 'payable',
    'if', 'else', 'for', 'while', 'do', 'break', 'continue',
    'emit', 'revert', 'require', 'unchecked',
]);

const SOL_TYPES = new Set([
    'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
    'int', 'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
    'bytes1', 'bytes2', 'bytes4', 'bytes8', 'bytes16', 'bytes32',
]);

const classForToken = (type, isLight) => {
    if (isLight) {
        if (type === 'comment') return 'text-slate-500';
        if (type === 'string') return 'text-[#0a3069]';
        if (type === 'number') return 'text-[#0550ae]';
        if (type === 'keyword') return 'text-[#8250df]';
        if (type === 'type') return 'text-[#0550ae]';
        if (type === 'literal') return 'text-[#0550ae]';
        if (type === 'punct') return 'text-slate-600';
        return 'text-slate-900';
    }

    if (type === 'comment') return 'text-slate-400';
    if (type === 'string') return 'text-emerald-300';
    if (type === 'number') return 'text-amber-300';
    if (type === 'keyword') return 'text-purple-300';
    if (type === 'type') return 'text-cyan-300';
    if (type === 'literal') return 'text-cyan-200';
    if (type === 'punct') return 'text-theme-text-muted';
    return 'text-theme-text-primary';
};

const highlightSolidityLine = (line, isLight) => {
    const tokens = [];

    const commentIndex = line.indexOf('//');
    const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
    const commentPart = commentIndex >= 0 ? line.slice(commentIndex) : '';

    let i = 0;
    const push = (text, type = 'plain') => {
        if (!text) return;
        tokens.push({ text, type });
    };

    while (i < codePart.length) {
        const ch = codePart[i];

        if (/\s/.test(ch)) {
            let j = i + 1;
            while (j < codePart.length && /\s/.test(codePart[j])) j++;
            push(codePart.slice(i, j), 'plain');
            i = j;
            continue;
        }

        if (ch === '"' || ch === '\'') {
            const quote = ch;
            let j = i + 1;
            while (j < codePart.length) {
                const cj = codePart[j];
                if (cj === '\\') { j += 2; continue; }
                if (cj === quote) { j++; break; }
                j++;
            }
            push(codePart.slice(i, j), 'string');
            i = j;
            continue;
        }

        if (/[0-9]/.test(ch)) {
            let j = i + 1;
            while (j < codePart.length && /[0-9_]/.test(codePart[j])) j++;
            if (codePart[j] === '.' && /[0-9]/.test(codePart[j + 1])) {
                j++;
                while (j < codePart.length && /[0-9_]/.test(codePart[j])) j++;
            }
            push(codePart.slice(i, j), 'number');
            i = j;
            continue;
        }

        if (/[A-Za-z_$]/.test(ch)) {
            let j = i + 1;
            while (j < codePart.length && /[A-Za-z0-9_$]/.test(codePart[j])) j++;
            const ident = codePart.slice(i, j);
            if (ident === 'true' || ident === 'false') push(ident, 'literal');
            else if (SOL_TYPES.has(ident)) push(ident, 'type');
            else if (SOL_KEYWORDS.has(ident)) push(ident, 'keyword');
            else push(ident, 'plain');
            i = j;
            continue;
        }

        push(ch, 'punct');
        i++;
    }

    if (commentPart) push(commentPart, 'comment');

    return tokens.map((t, idx) => (
        <span key={idx} className={classForToken(t.type, isLight)}>
            {t.text}
        </span>
    ));
};

const findRiscZeroRange = (content) => {
    const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
    const startA = lines.findIndex(l => l.includes('bytes32 journalHash'));
    const startB = lines.findIndex(l => l.includes('journalHash = sha256'));
    const end = lines.findIndex(l => l.includes('verifier.verify'));

    const start = [startA, startB].filter(n => n >= 0).sort((a, b) => a - b)[0];
    if (start === undefined || end < 0 || end < start) return null;

    return { startLine: start + 1, endLine: end + 1 };
};

const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

const downloadJson = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const ContractInspectorPage = () => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const { t } = useI18n();

    const [activeFileId, setActiveFileId] = useState(FILES[0].id);
    const [fileContents, setFileContents] = useState(() => ({}));
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [copied, setCopied] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [tooltip, setTooltip] = useState(null); // {x,y}

    const codeWrapRef = useRef(null);

    const activeFile = useMemo(
        () => FILES.find(f => f.id === activeFileId) || FILES[0],
        [activeFileId]
    );

    const activeContent = fileContents[activeFileId] || '';
    const riscRange = useMemo(() => {
        if (activeFileId !== 'GhostLinkSBT') return null;
        return findRiscZeroRange(activeContent);
    }, [activeFileId, activeContent]);

    useEffect(() => {
        let ignore = false;
        const load = async () => {
            if (fileContents[activeFileId]) return;
            setLoading(true);
            setLoadError('');
            try {
                const res = await fetch(activeFile.url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const text = await res.text();
                if (ignore) return;
                setFileContents(prev => ({ ...prev, [activeFileId]: text }));
                setScanKey(k => k + 1);
            } catch (e) {
                if (ignore) return;
                setLoadError(String(e?.message || e));
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        load();
        return () => { ignore = true; };
    }, [activeFileId, activeFile.url, fileContents]);

    useEffect(() => {
        setTooltip(null);
    }, [activeFileId]);

    const lines = useMemo(
        () => String(activeContent || '').replace(/\r\n/g, '\n').split('\n'),
        [activeContent]
    );

    const etherscanUrl = useMemo(
        () => `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`,
        []
    );

    const onCopy = async () => {
        try {
            await copyText(activeContent || '');
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error('Copy failed:', e);
        }
    };

    const onDownloadAbi = () => {
        downloadJson('GhostLinkSBT.abi.json', { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI });
    };

    const getTooltipStyle = () => {
        const wrapWidth = codeWrapRef.current?.clientWidth || 0;
        const maxLeft = Math.max(16, wrapWidth - 380);
        return {
            left: Math.min(tooltip.x + 16, maxLeft),
            top: Math.max(tooltip.y + 16, 16),
        };
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-6 relative overflow-hidden">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "url('/images/onchain_vault_cad.svg')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center top',
                    backgroundSize: 'min(1200px, 100%)',
                    opacity: isLight ? 0.22 : 0.12,
                    filter: isLight ? 'none' : 'invert(1) hue-rotate(180deg) saturate(1.2) contrast(1.1)',
                }}
            />

            <div className="max-w-7xl mx-auto relative">
                <div className="mb-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono tracking-wider
                                            bg-surface-2/60 border-theme-border-medium text-theme-text-muted">
                                <Info size={14} className="text-theme-accent-secondary" />
                                {t('contractInspector.tag')}
                            </div>
                            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-theme-text-primary">
                                {t('contractInspector.title')}
                            </h1>
                            <p className="mt-2 text-theme-text-secondary max-w-2xl">
                                {t('contractInspector.subtitle')}
                            </p>
                        </div>

                        <a
                            href={etherscanUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold
                                transition-all cursor-pointer
                                ${isLight
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15'
                                }
                            `}
                            title={t('contractInspector.openEtherscan')}
                        >
                            <ShieldCheck size={16} />
                            <span>{t('contractInspector.verifiedBadge')}</span>
                            <ExternalLink size={14} className="opacity-80" />
                        </a>
                    </div>
                </div>

                <div className="rounded-2xl border border-theme-border-medium overflow-hidden shadow-theme-strong bg-surface-elevated-1/80 dark:bg-white/5 backdrop-blur">
                    <div className="flex min-h-[640px]">
                        {/* File tree */}
                        <aside className="w-[280px] border-r border-theme-border-medium bg-surface-2/60 dark:bg-white/5">
                            <div className="px-4 py-3 border-b border-theme-border-medium flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-theme-text-muted">
                                    <FolderOpen size={14} />
                                    {t('contractInspector.fileTree')}
                                </div>
                            </div>

                            <div className="p-3">
                                <div className="flex items-center gap-2 text-sm font-mono text-theme-text-primary mb-2">
                                    <FolderOpen size={16} className="text-theme-accent-secondary" />
                                    contracts
                                </div>
                                <div className="space-y-1">
                                    {FILES.map((f) => {
                                        const isActive = f.id === activeFileId;
                                        return (
                                            <button
                                                key={f.id}
                                                onClick={() => setActiveFileId(f.id)}
                                                className={`
                                                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left
                                                    transition-all cursor-pointer
                                                    ${isActive
                                                        ? (isLight ? 'bg-slate-900 text-white shadow-physical-1' : 'bg-theme-accent-primary/10 text-theme-text-primary border border-theme-accent-primary/20')
                                                        : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-theme-text-muted hover:bg-white/5')
                                                    }
                                                `}
                                            >
                                                <FileCode2 size={16} className={isActive ? 'opacity-100' : 'opacity-70'} />
                                                <span className="text-sm">{f.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Code editor */}
                        <section className="flex-1 flex flex-col min-w-0">
                            <div className={`
                                px-4 py-3 border-b border-theme-border-medium flex items-center justify-between gap-3
                                ${isLight ? 'bg-white' : 'bg-white/5'}
                            `}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex gap-1.5 shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-xs font-mono text-theme-text-muted truncate">
                                            {activeFile.treePath}
                                        </div>
                                        <div className="text-xs font-mono text-theme-text-muted truncate">
                                            {t('contractInspector.contractAddress')}: {formatAddress(CONTRACT_ADDRESS)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={onCopy}
                                        className={`
                                            inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold
                                            transition-all cursor-pointer
                                            ${isLight
                                                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-physical-1'
                                                : 'bg-white/5 border-white/10 text-theme-text-primary hover:bg-white/10'
                                            }
                                        `}
                                        title={t('contractInspector.copySource')}
                                        disabled={!activeContent || loading}
                                    >
                                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        <span>{copied ? t('contractInspector.copied') : t('contractInspector.copy')}</span>
                                    </button>

                                    <button
                                        onClick={onDownloadAbi}
                                        className={`
                                            inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold
                                            transition-all cursor-pointer
                                            ${isLight
                                                ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-physical-2'
                                                : 'bg-theme-accent-primary/15 border-theme-accent-primary/25 text-theme-text-primary hover:bg-theme-accent-primary/20'
                                            }
                                        `}
                                        title={t('contractInspector.downloadAbi')}
                                    >
                                        <Download size={14} />
                                        <span>{t('contractInspector.downloadAbi')}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 relative min-h-0">
                                <div
                                    ref={codeWrapRef}
                                    className={`
                                        absolute inset-0 overflow-auto
                                        ${isLight ? 'bg-white' : 'bg-[#0b1020]/40'}
                                    `}
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    {loading && (
                                        <div className="p-6 text-sm text-theme-text-muted">{t('contractInspector.loading')}</div>
                                    )}
                                    {!!loadError && (
                                        <div className="p-6 text-sm text-red-500">{t('contractInspector.loadFailed')}: {loadError}</div>
                                    )}

                                    {!loading && !loadError && (
                                        <div className="px-6 py-5 font-mono text-[13px] leading-6">
                                            {lines.map((ln, idx) => {
                                                const lineNumber = idx + 1;
                                                const inRisc = riscRange && lineNumber >= riscRange.startLine && lineNumber <= riscRange.endLine;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`
                                                            group flex items-start gap-4
                                                            ${inRisc
                                                                ? (isLight ? 'bg-amber-50/60' : 'bg-emerald-500/5')
                                                                : ''
                                                            }
                                                        `}
                                                        onMouseEnter={(e) => {
                                                            if (!inRisc) return;
                                                            const wrap = codeWrapRef.current?.getBoundingClientRect();
                                                            if (!wrap) return;
                                                            setTooltip({
                                                                x: e.clientX - wrap.left,
                                                                y: e.clientY - wrap.top,
                                                            });
                                                        }}
                                                        onMouseMove={(e) => {
                                                            if (!inRisc) return;
                                                            const wrap = codeWrapRef.current?.getBoundingClientRect();
                                                            if (!wrap) return;
                                                            setTooltip({
                                                                x: e.clientX - wrap.left,
                                                                y: e.clientY - wrap.top,
                                                            });
                                                        }}
                                                    >
                                                        <div className={`
                                                            w-12 shrink-0 text-right select-none text-[12px]
                                                            ${isLight ? 'text-slate-400' : 'text-theme-text-dim'}
                                                        `}>
                                                            {lineNumber}
                                                        </div>
                                                        <div className="min-w-0 flex-1 whitespace-pre">
                                                            {highlightSolidityLine(ln, isLight)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 扫描审计效果 */}
                                    <AnimatePresence>
                                        {!loading && !loadError && !!activeContent && (
                                            <motion.div
                                                key={scanKey}
                                                initial={{ y: '-25%', opacity: 0 }}
                                                animate={{ y: '125%', opacity: [0, 1, 0] }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.35, ease: 'easeInOut' }}
                                                className={`
                                                    pointer-events-none absolute left-0 right-0 h-28
                                                    ${isLight
                                                        ? 'bg-gradient-to-b from-transparent via-slate-900/10 to-transparent'
                                                        : 'bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent'
                                                    }
                                                `}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* RISC Zero 说明浮层 */}
                                    <AnimatePresence>
                                        {tooltip && riscRange && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                className={`
                                                    pointer-events-none absolute z-10
                                                    w-[360px] max-w-[min(360px,calc(100%-24px))]
                                                    rounded-xl border p-4 shadow-theme-strong
                                                    ${isLight
                                                        ? 'bg-white border-slate-200 text-slate-900'
                                                        : 'bg-[#0b1020]/90 border-white/10 text-theme-text-primary backdrop-blur'
                                                    }
                                                `}
                                                style={getTooltipStyle()}
                                            >
                                                <div className="text-xs font-mono tracking-wider text-theme-text-muted mb-2">
                                                    {t('contractInspector.riscTitle')}
                                                </div>
                                                <div className="text-sm leading-relaxed">
                                                    {t('contractInspector.riscBody')}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractInspectorPage;
