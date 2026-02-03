import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { FolderOpen, FileCode2, ShieldCheck, ExternalLink, Copy, Check, Download, Github, Zap, Eye, Code2, ChevronRight } from 'lucide-react';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

// === File Tree Configuration ===
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

// === Function Logic Summaries ===
const FUNCTION_SUMMARIES = {
    'constructor': {
        name: 'constructor',
        signature: 'constructor(address _verifier, bytes32 _imageId, string _baseURI, string _name, string _symbol)',
        summary: 'Initializes the GhostLinkSBT contract with RISC Zero verifier address, guest program Image ID, and token metadata.',
        params: [
            '_verifier: RISC Zero Verifier Router address',
            '_imageId: Guest program Image ID (32 bytes)',
            '_baseURI: Base URI for token metadata',
            '_name: ERC721 token name',
            '_symbol: ERC721 token symbol'
        ],
        returns: null,
        zkRelated: true,
        lineRange: [77, 91]
    },
    'mint': {
        name: 'mint',
        signature: 'mint(bytes seal, bytes32 nullifier, CredentialType credType) → uint256',
        summary: 'Mints a new Soul Bound Token after verifying the ZK proof. The seal must contain a valid Groth16 proof from RISC Zero.',
        params: [
            'seal: ZK proof seal (Groth16 format with 4-byte selector)',
            'nullifier: Unique identifier to prevent double minting',
            'credType: Credential type enum (GITHUB=0, ALIPAY=1, TWITTER=2, WALLET=3)'
        ],
        returns: 'tokenId: The newly minted token ID',
        zkRelated: true,
        lineRange: [102, 144]
    },
    'getCredentials': {
        name: 'getCredentials',
        signature: 'getCredentials(address user) → Credential[]',
        summary: 'Returns all credentials (SBTs) owned by a specific user address.',
        params: ['user: The wallet address to query'],
        returns: 'Array of Credential structs containing type, timestamp, and nullifier',
        zkRelated: false,
        lineRange: [153, 166]
    },
    'hasCredentialType': {
        name: 'hasCredentialType',
        signature: 'hasCredentialType(address user, CredentialType credType) → bool',
        summary: 'Checks if a user has a specific type of credential.',
        params: [
            'user: The wallet address to check',
            'credType: The credential type to look for'
        ],
        returns: 'true if user has the credential type, false otherwise',
        zkRelated: false,
        lineRange: [174, 188]
    },
    'calculateJournalHash': {
        name: 'calculateJournalHash',
        signature: 'calculateJournalHash(address user, bytes32 nullifier, CredentialType credType) → bytes32',
        summary: 'Debug helper to calculate the expected SHA-256 journal hash. Useful for verifying proof parameters off-chain.',
        params: [
            'user: The recipient address',
            'nullifier: The nullifier from ZK proof',
            'credType: The credential type'
        ],
        returns: 'The calculated SHA-256 hash',
        zkRelated: true,
        lineRange: [211, 217]
    },
    'setImageId': {
        name: 'setImageId',
        signature: 'setImageId(bytes32 newImageId) [onlyOwner]',
        summary: 'Updates the guest program Image ID. Used when upgrading the ZK circuit.',
        params: ['newImageId: New 32-byte Image ID'],
        returns: null,
        zkRelated: true,
        lineRange: [268, 273]
    },
    'setVerifier': {
        name: 'setVerifier',
        signature: 'setVerifier(address newVerifier) [onlyOwner]',
        summary: 'Updates the RISC Zero Verifier contract address.',
        params: ['newVerifier: New verifier contract address'],
        returns: null,
        zkRelated: true,
        lineRange: [279, 284]
    },
    '_update': {
        name: '_update',
        signature: '_update(address to, uint256 tokenId, address auth) → address [internal]',
        summary: 'Overrides ERC721 transfer to enforce SBT (Soul Bound Token) non-transferability. Only minting and burning are allowed.',
        params: [
            'to: Recipient address',
            'tokenId: Token ID being transferred',
            'auth: Authorized address'
        ],
        returns: 'Previous owner address',
        zkRelated: false,
        lineRange: [302, 317]
    },
    'totalSupply': {
        name: 'totalSupply',
        signature: 'totalSupply() → uint256',
        summary: 'Returns the total number of SBTs that have been minted.',
        params: [],
        returns: 'Total minted token count',
        zkRelated: false,
        lineRange: [339, 341]
    }
};

// === Solidity Syntax Highlighting ===
const SOL_KEYWORDS = new Set([
    'pragma', 'solidity', 'import', 'from', 'as', 'using',
    'contract', 'interface', 'library', 'struct', 'enum', 'event',
    'constructor', 'function', 'returns', 'return', 'modifier',
    'mapping', 'address', 'bool', 'string', 'bytes', 'calldata', 'memory', 'storage',
    'public', 'private', 'internal', 'external', 'view', 'pure', 'payable',
    'if', 'else', 'for', 'while', 'do', 'break', 'continue',
    'emit', 'revert', 'require', 'unchecked', 'override', 'virtual',
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
    const push = (text, type = 'plain') => { if (text) tokens.push({ text, type }); };

    while (i < codePart.length) {
        const ch = codePart[i];
        if (/\s/.test(ch)) {
            let j = i + 1;
            while (j < codePart.length && /\s/.test(codePart[j])) j++;
            push(codePart.slice(i, j), 'plain');
            i = j;
            continue;
        }
        if (ch === '"' || ch === "'") {
            const quote = ch;
            let j = i + 1;
            while (j < codePart.length) {
                if (codePart[j] === '\\') { j += 2; continue; }
                if (codePart[j] === quote) { j++; break; }
                j++;
            }
            push(codePart.slice(i, j), 'string');
            i = j;
            continue;
        }
        if (/[0-9]/.test(ch)) {
            let j = i + 1;
            while (j < codePart.length && /[0-9_]/.test(codePart[j])) j++;
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
        <span key={idx} className={classForToken(t.type, isLight)}>{t.text}</span>
    ));
};

// === ZK Logic Line Detection ===
const ZK_KEYWORDS = ['verifier', 'verify', 'imageId', 'journalHash', 'seal', 'sha256', 'IRiscZeroVerifier'];
const isZkRelatedLine = (line) => ZK_KEYWORDS.some(kw => line.includes(kw));

// === Utility Functions ===
const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

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

// === Main Component ===
export const ContractInspectorPage = () => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const { t } = useI18n();

    const [activeFileId, setActiveFileId] = useState(FILES[0].id);
    const [fileContents, setFileContents] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [copied, setCopied] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [zkTooltip, setZkTooltip] = useState(null);
    const [activeLine, setActiveLine] = useState(0);
    const [activeFunction, setActiveFunction] = useState(null);

    const codeWrapRef = useRef(null);
    const containerRef = useRef(null);

    // Parallax effect
    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 500], [0, 50]);

    const activeFile = useMemo(
        () => FILES.find(f => f.id === activeFileId) || FILES[0],
        [activeFileId]
    );

    const activeContent = fileContents[activeFileId] || '';
    const lines = useMemo(
        () => String(activeContent || '').replace(/\r\n/g, '\n').split('\n'),
        [activeContent]
    );

    // Load file content
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

    // Detect active function based on scroll position
    const handleCodeScroll = useCallback((e) => {
        const scrollTop = e.target.scrollTop;
        const lineHeight = 24; // Approximate line height
        const visibleLine = Math.floor(scrollTop / lineHeight) + 1;
        setActiveLine(visibleLine);

        // Find which function this line belongs to
        for (const [key, func] of Object.entries(FUNCTION_SUMMARIES)) {
            if (visibleLine >= func.lineRange[0] && visibleLine <= func.lineRange[1]) {
                setActiveFunction(func);
                return;
            }
        }
        setActiveFunction(null);
    }, []);

    const etherscanUrl = useMemo(
        () => `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`,
        []
    );

    const githubUrl = 'https://github.com/kyp2022/ghostlink/blob/main/contracts/GhostLinkSBT.sol';

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

    return (
        <div ref={containerRef} className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden">
            {/* Parallax Background with Verified Seal */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "url('/images/vault_blueprint_verified.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                    opacity: isLight ? 0.08 : 0.04,
                    filter: isLight ? 'none' : 'invert(1) hue-rotate(180deg) saturate(1.2) brightness(1.1)',
                    y: backgroundY,
                }}
            />

            <div className="max-w-[1400px] mx-auto relative">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono tracking-wider
                                bg-surface-2/60 border-theme-border-medium text-theme-text-muted mb-3">
                                <Code2 size={14} className="text-theme-accent-secondary" />
                                {t('contractInspector.tag')}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-theme-text-primary">
                                {t('contractInspector.title')}
                            </h1>
                            <p className="mt-1 text-theme-text-secondary text-sm max-w-xl">
                                {t('contractInspector.subtitle')}
                            </p>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                            <a
                                href={etherscanUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                    ${isLight
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15'
                                    }`}
                            >
                                <ShieldCheck size={14} />
                                {t('contractInspector.verifiedBadge')}
                                <ExternalLink size={12} />
                            </a>

                            <button
                                onClick={onDownloadAbi}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                    ${isLight
                                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-physical-1'
                                        : 'bg-white/5 border-white/10 text-theme-text-primary hover:bg-white/10'
                                    }`}
                            >
                                <Download size={14} />
                                {t('contractInspector.copyAbi')}
                            </button>

                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                    ${isLight
                                        ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                                        : 'bg-theme-accent-primary/15 border-theme-accent-primary/25 text-theme-text-primary hover:bg-theme-accent-primary/20'
                                    }`}
                            >
                                <Github size={14} />
                                {t('contractInspector.viewOnGithub')}
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Three-Column Blueprint Studio Layout */}
                <div className="rounded-2xl border border-theme-border-medium overflow-hidden shadow-theme-strong bg-surface-elevated-1/80 dark:bg-white/5 backdrop-blur">
                    <div className="flex min-h-[700px]">
                        {/* LEFT: File Explorer */}
                        <aside className="w-[220px] border-r border-theme-border-medium bg-surface-2/60 dark:bg-white/5 shrink-0">
                            <div className="px-4 py-3 border-b border-theme-border-medium">
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
                                <div className="space-y-1 ml-2">
                                    {FILES.map((f) => {
                                        const isActive = f.id === activeFileId;
                                        return (
                                            <button
                                                key={f.id}
                                                onClick={() => setActiveFileId(f.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-pointer text-sm
                                                    ${isActive
                                                        ? (isLight ? 'bg-slate-900 text-white' : 'bg-theme-accent-primary/10 text-theme-text-primary border border-theme-accent-primary/20')
                                                        : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-theme-text-muted hover:bg-white/5')
                                                    }`}
                                            >
                                                <FileCode2 size={14} className={isActive ? 'opacity-100' : 'opacity-70'} />
                                                <span className="truncate">{f.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 pt-4 border-t border-theme-border-subtle">
                                    <div className="text-xs font-mono text-theme-text-muted mb-2">{t('contractInspector.contractAddress')}</div>
                                    <div className="text-xs font-mono text-theme-text-secondary break-all">
                                        {formatAddress(CONTRACT_ADDRESS)}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* CENTER: Code Display */}
                        <section className="flex-1 flex flex-col min-w-0">
                            {/* Code Header */}
                            <div className={`px-4 py-3 border-b border-theme-border-medium flex items-center justify-between gap-3 ${isLight ? 'bg-white' : 'bg-white/5'}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex gap-1.5 shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                                    </div>
                                    <div className="text-xs font-mono text-theme-text-muted truncate">
                                        {activeFile.treePath}
                                    </div>
                                </div>
                                <button
                                    onClick={onCopy}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                        ${isLight
                                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                            : 'bg-white/5 border-white/10 text-theme-text-primary hover:bg-white/10'
                                        }`}
                                    disabled={!activeContent || loading}
                                >
                                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    {copied ? t('contractInspector.copied') : t('contractInspector.copy')}
                                </button>
                            </div>

                            {/* Code Area with Laser Scanner */}
                            <div className="flex-1 relative min-h-0">
                                <div
                                    ref={codeWrapRef}
                                    className={`absolute inset-0 overflow-auto ${isLight ? 'bg-white' : 'bg-[#0b1020]/40'}`}
                                    onScroll={handleCodeScroll}
                                >
                                    {loading && (
                                        <div className="p-6 text-sm text-theme-text-muted">{t('contractInspector.loading')}</div>
                                    )}
                                    {!!loadError && (
                                        <div className="p-6 text-sm text-red-500">{t('contractInspector.loadFailed')}: {loadError}</div>
                                    )}

                                    {!loading && !loadError && (
                                        <div className="px-4 py-4 font-mono text-[13px] leading-6 relative">
                                            {lines.map((ln, idx) => {
                                                const lineNumber = idx + 1;
                                                const isZkLine = isZkRelatedLine(ln);
                                                const isActiveLineCurrent = lineNumber === activeLine;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`group flex items-start gap-3 relative transition-all duration-150
                                                            ${isZkLine ? 'hover:bg-cyan-500/10' : ''}
                                                            ${isActiveLineCurrent ? 'bg-theme-accent-primary/5' : ''}`}
                                                        onMouseEnter={() => {
                                                            if (isZkLine) setZkTooltip(lineNumber);
                                                        }}
                                                        onMouseLeave={() => setZkTooltip(null)}
                                                    >
                                                        {/* Line Number */}
                                                        <div className={`w-10 shrink-0 text-right select-none text-[11px] ${isLight ? 'text-slate-400' : 'text-theme-text-dim'}`}>
                                                            {lineNumber}
                                                        </div>

                                                        {/* ZK Indicator */}
                                                        {isZkLine && (
                                                            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                        )}

                                                        {/* Code Content */}
                                                        <div className={`min-w-0 flex-1 whitespace-pre ${isZkLine ? 'pl-3' : ''}`}>
                                                            {highlightSolidityLine(ln, isLight)}
                                                        </div>

                                                        {/* ZK Tooltip */}
                                                        <AnimatePresence>
                                                            {zkTooltip === lineNumber && isZkLine && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: 10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: 10 }}
                                                                    className={`absolute right-4 top-0 z-20 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider
                                                                        ${isLight
                                                                            ? 'bg-cyan-600 text-white shadow-lg'
                                                                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Zap size={12} />
                                                                        {t('contractInspector.zkBadge')}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Scanning Animation on Load */}
                                    <AnimatePresence>
                                        {!loading && !loadError && !!activeContent && (
                                            <motion.div
                                                key={scanKey}
                                                initial={{ y: '-10%', opacity: 0 }}
                                                animate={{ y: '110%', opacity: [0, 1, 1, 0] }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 2, ease: 'linear' }}
                                                className="pointer-events-none absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_4px_rgba(0,255,255,0.6)]"
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Active Line Laser Scanner */}
                                    {activeLine > 0 && !loading && (
                                        <motion.div
                                            className="pointer-events-none absolute left-0 right-0 h-[1px] bg-cyan-400/50"
                                            style={{ top: `${(activeLine - 1) * 24 + 16}px` }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.5 }}
                                        />
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* RIGHT: Live Logic Summary */}
                        <aside className="w-[300px] border-l border-theme-border-medium bg-surface-2/60 dark:bg-white/5 shrink-0 hidden xl:block">
                            <div className="px-4 py-3 border-b border-theme-border-medium">
                                <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-theme-text-muted">
                                    <Eye size={14} />
                                    {t('contractInspector.liveLogicSummary')}
                                </div>
                            </div>

                            <div className="p-4">
                                <AnimatePresence mode="wait">
                                    {activeFunction ? (
                                        <motion.div
                                            key={activeFunction.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Function Name */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {activeFunction.zkRelated && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                                            ZK
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-bold text-theme-text-primary font-mono">
                                                        {activeFunction.name}()
                                                    </span>
                                                </div>
                                                <code className="text-[11px] text-theme-text-muted block bg-surface-3/50 rounded-lg p-2 font-mono break-all">
                                                    {activeFunction.signature}
                                                </code>
                                            </div>

                                            {/* Summary */}
                                            <div>
                                                <div className="text-[10px] font-mono text-theme-text-dim uppercase tracking-wider mb-1">
                                                    {t('contractInspector.summary')}
                                                </div>
                                                <p className="text-sm text-theme-text-secondary leading-relaxed">
                                                    {activeFunction.summary}
                                                </p>
                                            </div>

                                            {/* Parameters */}
                                            {activeFunction.params.length > 0 && (
                                                <div>
                                                    <div className="text-[10px] font-mono text-theme-text-dim uppercase tracking-wider mb-2">
                                                        {t('contractInspector.parameters')}
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {activeFunction.params.map((p, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-xs">
                                                                <ChevronRight size={12} className="text-theme-accent-secondary shrink-0 mt-0.5" />
                                                                <span className="text-theme-text-secondary">{p}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Returns */}
                                            {activeFunction.returns && (
                                                <div>
                                                    <div className="text-[10px] font-mono text-theme-text-dim uppercase tracking-wider mb-1">
                                                        {t('contractInspector.returns')}
                                                    </div>
                                                    <p className="text-xs text-theme-text-secondary">
                                                        {activeFunction.returns}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-theme-border-subtle">
                                                <div className="text-[10px] font-mono text-theme-text-dim">
                                                    {t('contractInspector.lines')} {activeFunction.lineRange[0]}–{activeFunction.lineRange[1]}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            <Eye size={32} className="mx-auto text-theme-text-dim mb-3 opacity-50" />
                                            <p className="text-sm text-theme-text-muted">
                                                {t('contractInspector.scrollToSee')}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractInspectorPage;
