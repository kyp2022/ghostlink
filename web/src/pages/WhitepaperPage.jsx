import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
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
                    className="px-1.5 py-0.5 rounded bg-surface-elevated-2 dark:bg-white/10 border border-theme-border-medium font-mono text-[12px]"
                >
                    {t.value}
                </code>
            );
        }
        if (t.type === 'bold') return <strong key={idx} className="font-semibold text-theme-text-primary">{t.value}</strong>;
        if (t.type === 'link') {
            return (
                <a
                    key={idx}
                    href={t.href}
                    target={t.href?.startsWith('http') ? '_blank' : undefined}
                    rel={t.href?.startsWith('http') ? 'noreferrer' : undefined}
                    className="text-theme-accent-primary hover:text-theme-accent-secondary underline underline-offset-4"
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
    let list = null; // {type:'ul'|'ol', items:[]}
    let inCode = false;
    let codeLang = '';
    let code = [];

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

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trimEnd();

        if (line.startsWith('```')) {
            if (!inCode) {
                flushParagraph();
                flushList();
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

        const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();
            const level = headingMatch[1].length;
            const text = headingMatch[2].trim();
            blocks.push({ type: 'h', level, text });
            continue;
        }

        const ulMatch = line.match(/^- (.+)$/);
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
    if (inCode) flushCode();

    return blocks;
};

export const WhitepaperPage = ({ onBack }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const { locale } = useI18n();
    const isZh = locale === 'zh';
    const [raw, setRaw] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/whitepaper.md', { cache: 'no-store' });
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

    const headerTitle = 'Whitepaper';
    const headerDesc = 'Turn real-world signals into verifiable on-chain credentials with privacy in mind';

    // Build ids consistently for headings
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

    return (
        <div className={`min-h-screen ${isLight ? 'bg-white' : 'bg-surface-base'} pt-10 pb-16 px-6`}>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated-1 border border-theme-border-medium text-theme-text-primary hover:border-theme-border-strong transition-all cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm font-semibold">{isZh ? '返回' : 'Back'}</span>
                    </button>
                    <div className="flex items-center gap-2 text-theme-text-muted">
                        <FileText size={16} className="text-theme-accent-primary" />
                        <span className="text-xs font-mono tracking-widest">{isZh ? '公开文档' : 'DOCUMENT'}</span>
                    </div>
                </div>

                <div className={`rounded-2xl border border-theme-border-medium overflow-hidden shadow-theme-strong ${isLight ? 'bg-white' : 'bg-surface-elevated-1'}`}>
                    <div className="p-6 md:p-8 border-b border-theme-border-medium bg-surface-elevated-2/60">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="text-2xl md:text-3xl font-bold text-theme-text-primary tracking-tight"
                        >
                            GhostLink {headerTitle}
                        </motion.h1>
                        <p className="mt-2 text-theme-text-secondary text-sm md:text-base leading-relaxed">
                            {headerDesc}
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        {loading && (
                            <div className="flex items-center gap-2 text-theme-text-muted">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">{isZh ? '正在加载…' : 'Loading…'}</span>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="flex items-start gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5 mt-0.5" />
                                <div>
                                    <div className="text-sm font-semibold">{isZh ? '加载失败' : 'Failed to load'}</div>
                                    <div className="text-sm opacity-90">{error}</div>
                                </div>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <aside className="lg:col-span-4">
                                    <div className="sticky top-24">
                                        <div className="rounded-xl border border-theme-border-medium bg-surface-elevated-2/50 p-4">
                                            <div className="text-xs font-mono tracking-widest text-theme-text-muted mb-3">
                                                {isZh ? '目录' : 'CONTENTS'}
                                            </div>
                                            <div className="space-y-2">
                                                {toc.length === 0 ? (
                                                    <div className="text-sm text-theme-text-muted">{isZh ? '暂无目录' : 'No contents'}</div>
                                                ) : (
                                                    toc.map((i) => (
                                                        <a
                                                            key={i.id}
                                                            href={`#${i.id}`}
                                                            className={`block text-sm text-theme-text-muted hover:text-theme-text-primary transition-colors ${
                                                                i.level === 3 ? 'pl-4' : 'pl-0'
                                                            }`}
                                                        >
                                                            {i.text}
                                                        </a>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </aside>

                                <main className="lg:col-span-8">
                                    <div className="space-y-5">
                                        {blocks.map((b, idx) => {
                                            if (b.type === 'h') {
                                                const id = headingIdMap.get(idx);
                                                const Tag = b.level === 1 ? 'h2' : b.level === 2 ? 'h3' : 'h4';
                                                const cls = b.level === 1
                                                    ? 'text-xl md:text-2xl font-bold text-theme-text-primary mt-6'
                                                    : b.level === 2
                                                        ? 'text-lg md:text-xl font-semibold text-theme-text-primary mt-6'
                                                        : 'text-base font-semibold text-theme-text-primary mt-5';
                                                return (
                                                    <Tag key={idx} id={id} className={cls}>
                                                        {b.text}
                                                    </Tag>
                                                );
                                            }
                                            if (b.type === 'p') {
                                                return (
                                                    <p key={idx} className="text-theme-text-secondary leading-relaxed">
                                                        {renderInline(b.text)}
                                                    </p>
                                                );
                                            }
                                            if (b.type === 'ul') {
                                                return (
                                                    <ul key={idx} className="list-disc pl-5 space-y-1 text-theme-text-secondary">
                                                        {b.items.map((it, i) => (
                                                            <li key={i} className="leading-relaxed">
                                                                {renderInline(it)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                );
                                            }
                                            if (b.type === 'ol') {
                                                return (
                                                    <ol key={idx} className="list-decimal pl-5 space-y-1 text-theme-text-secondary">
                                                        {b.items.map((it, i) => (
                                                            <li key={i} className="leading-relaxed">
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
                                                        className="rounded-xl border border-theme-border-medium bg-surface-elevated-2 dark:bg-white/5 overflow-x-auto p-4"
                                                    >
                                                        <code className="font-mono text-[12px] text-theme-text-primary">
                                                            {b.text}
                                                        </code>
                                                    </pre>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </main>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhitepaperPage;
