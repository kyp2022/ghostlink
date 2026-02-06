import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, AlertCircle, Loader2, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

const slugify = (text) => {
    return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const splitInline = (text) => {
    const parts = [];
    let rest = text;

    const pushText = (t) => {
        if (t) parts.push({ type: 'text', value: t });
    };

    while (rest.length > 0) {
        const codeStart = rest.indexOf('`');
        const boldStart = rest.indexOf('**');
        const linkStart = rest.indexOf('[');

        const candidates = [
            { type: 'code', idx: codeStart },
            { type: 'bold', idx: boldStart },
            { type: 'link', idx: linkStart }
        ].filter(c => c.idx !== -1).sort((a, b) => a.idx - b.idx);

        if (candidates.length === 0) {
            pushText(rest);
            break;
        }

        const next = candidates[0];
        pushText(rest.slice(0, next.idx));
        rest = rest.slice(next.idx);

        if (next.type === 'code' && rest.startsWith('`')) {
            const end = rest.indexOf('`', 1);
            if (end === -1) {
                pushText(rest);
                break;
            }
            parts.push({ type: 'code', value: rest.slice(1, end) });
            rest = rest.slice(end + 1);
            continue;
        }

        if (next.type === 'bold' && rest.startsWith('**')) {
            const end = rest.indexOf('**', 2);
            if (end === -1) {
                pushText(rest);
                break;
            }
            parts.push({ type: 'bold', value: rest.slice(2, end) });
            rest = rest.slice(end + 2);
            continue;
        }

        if (next.type === 'link' && rest.startsWith('[')) {
            const close = rest.indexOf(']');
            const openParen = rest.indexOf('(', close);
            const closeParen = rest.indexOf(')', openParen);
            if (close !== -1 && openParen === close + 1 && closeParen !== -1) {
                const label = rest.slice(1, close);
                const href = rest.slice(openParen + 1, closeParen);
                parts.push({ type: 'link', label, href });
                rest = rest.slice(closeParen + 1);
                continue;
            }
        }

        pushText(rest.slice(0, 1));
        rest = rest.slice(1);
    }

    return parts;
};

const renderInline = (text) => {
    const tokens = splitInline(text);
    return tokens.map((t, idx) => {
        if (t.type === 'code') {
            return (
                <code
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-[13px] text-slate-700 dark:text-cyan-300"
                >
                    {t.value}
                </code>
            );
        }
        if (t.type === 'bold') return <strong key={idx} className="font-semibold text-slate-900 dark:text-white">{t.value}</strong>;
        if (t.type === 'link') {
            return (
                <a
                    key={idx}
                    href={t.href}
                    target={t.href?.startsWith('http') ? '_blank' : undefined}
                    rel={t.href?.startsWith('http') ? 'noreferrer' : undefined}
                    className="text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 underline underline-offset-4 transition-colors"
                >
                    {t.label}
                </a>
            );
        }
        return <span key={idx}>{t.value}</span>;
    });
};

const parseMarkdown = (md) => {
    const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let paragraph = [];
    let list = null;
    let inCode = false;
    let codeLang = '';
    let code = [];
    let inTable = false;
    let tableRows = [];

    const flushParagraph = () => {
        if (paragraph.length === 0) return;
        blocks.push({ type: 'p', text: paragraph.join(' ') });
        paragraph = [];
    };

    const flushList = () => {
        if (!list || list.items.length === 0) return;
        blocks.push(list);
        list = null;
    };

    const flushCode = () => {
        blocks.push({ type: 'code', lang: codeLang, text: code.join('\n') });
        codeLang = '';
        code = [];
    };

    const flushTable = () => {
        if (tableRows.length === 0) return;
        blocks.push({ type: 'table', rows: tableRows });
        tableRows = [];
        inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trimEnd();

        if (line.startsWith('```')) {
            if (!inCode) {
                flushParagraph();
                flushList();
                flushTable();
                inCode = true;
                codeLang = line.slice(3).trim();
                continue;
            }
            inCode = false;
            flushCode();
            continue;
        }

        if (inCode) {
            code.push(raw);
            continue;
        }

        // Table detection
        if (line.startsWith('|') && line.endsWith('|')) {
            flushParagraph();
            flushList();
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            // Skip separator rows
            if (cells.every(c => /^[-:]+$/.test(c))) {
                continue;
            }
            if (!inTable) inTable = true;
            tableRows.push(cells);
            continue;
        } else if (inTable) {
            flushTable();
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();
            const level = headingMatch[1].length;
            const text = headingMatch[2].trim();
            blocks.push({ type: 'h', level, text });
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim())) {
            flushParagraph();
            flushList();
            blocks.push({ type: 'hr' });
            continue;
        }

        const ulMatch = line.match(/^[-*]\s+(.+)$/);
        const olMatch = line.match(/^\d+\.\s+(.+)$/);
        if (ulMatch || olMatch) {
            flushParagraph();
            const nextType = ulMatch ? 'ul' : 'ol';
            if (!list || list.type !== nextType) {
                flushList();
                list = { type: nextType, items: [] };
            }
            list.items.push((ulMatch || olMatch)[1].trim());
            continue;
        }

        if (line.trim() === '') {
            flushParagraph();
            flushList();
            continue;
        }

        paragraph.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushTable();
    if (inCode) flushCode();

    return blocks;
};

// Detect special block types from content
const detectSpecialBlock = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('note:') || lowerText.includes('tip:') || lowerText.includes('info:')) {
        return 'note';
    }
    if (lowerText.includes('warning:') || lowerText.includes('caution:') || lowerText.includes('important:')) {
        return 'warning';
    }
    if (lowerText.includes('definition:') || text.includes('**Definition**') || text.includes('**Concept**')) {
        return 'definition';
    }
    return null;
};

export const WhitepaperPage = ({ onBack }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const { locale } = useI18n();
    const isZh = locale === 'zh';
    const [raw, setRaw] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}whitepaper.md`, { cache: 'no-store' });
                if (!res.ok) throw new Error(`加载失败：${res.status}`);
                const text = await res.text();
                if (!cancelled) setRaw(text);
            } catch (e) {
                if (!cancelled) setError(e?.message || (isZh ? '加载失败' : 'Failed to load'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [isZh]);

    const blocks = useMemo(() => parseMarkdown(raw), [raw]);

    const toc = useMemo(() => {
        const list = [];
        const used = new Map();
        blocks.forEach((b) => {
            if (b.type !== 'h') return;
            if (b.level === 1) return;
            const base = slugify(b.text) || 'section';
            const count = (used.get(base) || 0) + 1;
            used.set(base, count);
            const id = count === 1 ? base : `${base}-${count}`;
            list.push({ id, level: b.level, text: b.text });
        });
        return list;
    }, [blocks]);

    const headingIdMap = useMemo(() => {
        const map = new Map();
        const used = new Map();
        blocks.forEach((b, idx) => {
            if (b.type !== 'h') return;
            const base = slugify(b.text) || `h-${idx}`;
            const count = (used.get(base) || 0) + 1;
            used.set(base, count);
            const id = count === 1 ? base : `${base}-${count}`;
            map.set(idx, id);
        });
        return map;
    }, [blocks]);

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const headings = document.querySelectorAll('[data-heading-id]');
            let current = '';
            headings.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 120) {
                    current = el.getAttribute('data-heading-id') || '';
                }
            });
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [blocks]);

    return (
        <div className={`min-h-screen ${isLight ? 'bg-white' : 'bg-surface-base'}`}>
            {/* Blueprint Grid Background */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #64748b 1px, transparent 1px),
                        linear-gradient(to bottom, #64748b 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Hero Section */}
            <div className={`relative border-b ${isLight ? 'border-slate-200 bg-gradient-to-b from-slate-50 to-white' : 'border-white/10 bg-gradient-to-b from-surface-elevated-1 to-surface-base'}`}>
                <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
                    <button
                        onClick={onBack}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg mb-8 transition-all cursor-pointer ${isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 text-white/80'
                            }`}
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">{isZh ? '返回首页' : 'Back to Home'}</span>
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className={`w-6 h-6 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                            <span className={`text-xs font-mono tracking-[0.2em] uppercase ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                                Technical Documentation
                            </span>
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            GhostLink Protocol
                        </h1>
                        <p className={`text-lg md:text-xl mb-6 max-w-2xl ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                            A Zero-Knowledge Framework for Privacy-Preserved Web2-to-Web3 Data Bridging
                        </p>
                        <div className={`flex flex-wrap items-center gap-4 text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                            <span className="font-mono">Version: 1.0</span>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            <span className="font-mono">February 2026</span>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                Mainnet Ready
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Sidebar - Sticky TOC */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-24">
                            <div className={`rounded-xl p-5 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-surface-elevated-1 border border-white/10'}`}>
                                <h3 className={`text-xs font-mono tracking-[0.2em] uppercase mb-4 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                                    {isZh ? '目录' : 'Contents'}
                                </h3>
                                {loading ? (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">{isZh ? '加载中...' : 'Loading...'}</span>
                                    </div>
                                ) : (
                                    <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                                        {toc.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={`block py-1.5 text-sm transition-all border-l-2 ${item.level === 3 ? 'pl-5' : 'pl-3'
                                                    } ${activeSection === item.id
                                                        ? isLight
                                                            ? 'border-blue-500 text-blue-700 font-medium bg-blue-50 -ml-px'
                                                            : 'border-cyan-400 text-cyan-400 font-medium bg-cyan-500/10 -ml-px'
                                                        : isLight
                                                            ? 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                                            : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/30'
                                                    }`}
                                            >
                                                {item.text.length > 40 ? item.text.slice(0, 40) + '...' : item.text}
                                            </a>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Right Panel - Main Content */}
                    <main className="lg:col-span-9">
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className={`w-8 h-8 animate-spin ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
                            </div>
                        )}

                        {!loading && error && (
                            <div className={`flex items-start gap-3 p-4 rounded-xl ${isLight ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/30'}`}>
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium text-red-700 dark:text-red-400">{isZh ? '加载失败' : 'Failed to load'}</div>
                                    <div className="text-sm text-red-600 dark:text-red-300/80">{error}</div>
                                </div>
                            </div>
                        )}

                        {!loading && !error && (
                            <article className="prose-container space-y-6" style={{ maxWidth: '90ch' }}>
                                {blocks.map((b, idx) => {
                                    if (b.type === 'h') {
                                        const id = headingIdMap.get(idx);
                                        const Tag = b.level === 1 ? 'h1' : b.level === 2 ? 'h2' : 'h3';
                                        const classes = {
                                            1: `text-3xl md:text-4xl font-bold tracking-tight mt-12 mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`,
                                            2: `text-2xl md:text-2xl font-bold tracking-tight mt-10 mb-4 pt-6 border-t ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-white/10'}`,
                                            3: `text-lg md:text-xl font-semibold mt-8 mb-3 ${isLight ? 'text-slate-800' : 'text-white/90'}`
                                        };
                                        return (
                                            <Tag
                                                key={idx}
                                                id={id}
                                                data-heading-id={id}
                                                className={classes[b.level]}
                                                style={{ fontFamily: b.level <= 2 ? "'JetBrains Mono', monospace" : 'Inter, system-ui, sans-serif' }}
                                            >
                                                {b.text}
                                            </Tag>
                                        );
                                    }
                                    if (b.type === 'p') {
                                        const specialType = detectSpecialBlock(b.text);
                                        if (specialType === 'note') {
                                            return (
                                                <div key={idx} className={`flex gap-3 p-4 rounded-xl border-l-4 ${isLight ? 'bg-blue-50 border-blue-500' : 'bg-blue-500/10 border-blue-400'}`}>
                                                    <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                                    <p className={`text-[15px] leading-relaxed ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>
                                                        {renderInline(b.text)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        if (specialType === 'warning') {
                                            return (
                                                <div key={idx} className={`flex gap-3 p-4 rounded-xl border-l-4 ${isLight ? 'bg-amber-50 border-amber-500' : 'bg-amber-500/10 border-amber-400'}`}>
                                                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                                                    <p className={`text-[15px] leading-relaxed ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>
                                                        {renderInline(b.text)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        if (specialType === 'definition') {
                                            return (
                                                <div key={idx} className={`p-4 rounded-xl border-l-4 ${isLight ? 'bg-slate-50 border-slate-400' : 'bg-white/5 border-white/30'}`}>
                                                    <p className={`text-[15px] leading-relaxed ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                                                        {renderInline(b.text)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return (
                                            <p key={idx} className={`text-[16px] leading-[1.75] ${isLight ? 'text-slate-700' : 'text-white/80'}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                                {renderInline(b.text)}
                                            </p>
                                        );
                                    }
                                    if (b.type === 'ul') {
                                        return (
                                            <ul key={idx} className={`list-disc pl-6 space-y-2 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                                                {b.items.map((it, i) => (
                                                    <li key={i} className="text-[15px] leading-relaxed pl-1">
                                                        {renderInline(it)}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                    if (b.type === 'ol') {
                                        return (
                                            <ol key={idx} className={`list-decimal pl-6 space-y-2 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                                                {b.items.map((it, i) => (
                                                    <li key={i} className="text-[15px] leading-relaxed pl-1">
                                                        {renderInline(it)}
                                                    </li>
                                                ))}
                                            </ol>
                                        );
                                    }
                                    if (b.type === 'code') {
                                        return (
                                            <pre
                                                key={idx}
                                                className={`rounded-xl overflow-x-auto p-5 shadow-sm ${isLight ? 'bg-slate-900 text-slate-100' : 'bg-black/50 text-white/90 border border-white/10'}`}
                                            >
                                                {b.lang && (
                                                    <div className={`text-xs font-mono mb-3 pb-2 border-b ${isLight ? 'text-slate-500 border-slate-700' : 'text-white/40 border-white/10'}`}>
                                                        {b.lang}
                                                    </div>
                                                )}
                                                <code className="font-mono text-[13px] leading-relaxed">
                                                    {b.text}
                                                </code>
                                            </pre>
                                        );
                                    }
                                    if (b.type === 'table') {
                                        return (
                                            <div key={idx} className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className={isLight ? 'bg-slate-50' : 'bg-white/5'}>
                                                            {b.rows[0]?.map((cell, ci) => (
                                                                <th key={ci} className={`px-4 py-3 text-left font-semibold ${isLight ? 'text-slate-900 border-b border-slate-200' : 'text-white border-b border-white/10'}`}>
                                                                    {renderInline(cell)}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {b.rows.slice(1).map((row, ri) => (
                                                            <tr key={ri} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                                                                {row.map((cell, ci) => (
                                                                    <td key={ci} className={`px-4 py-3 ${isLight ? 'text-slate-700 border-b border-slate-100' : 'text-white/80 border-b border-white/5'}`}>
                                                                        {renderInline(cell)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    }
                                    if (b.type === 'hr') {
                                        return <hr key={idx} className={`my-8 ${isLight ? 'border-slate-200' : 'border-white/10'}`} />;
                                    }
                                    return null;
                                })}
                            </article>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default WhitepaperPage;
