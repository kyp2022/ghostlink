import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import {
    Search, RefreshCw, ExternalLink, Activity,
    Award, Clock, Loader, Bell,
    Copy, CheckCircle, Wallet,
    TrendingUp, ArrowUpDown, X, FileText
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/constants';
import { useI18n } from '../contexts/I18nContext';

// Credential type icons
const CredentialIcon = ({ type }) => {
    // Basic implementation for now
    return <Award size={16} />;
};

export const ExplorerPage = ({ walletSigner }) => {
    const { locale } = useI18n();
    const isZh = locale === 'zh';
    const s = (en, zh) => (isZh ? zh : en);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalSupply: 0,
        recentMints: [],
        chartData: [],
        holderDistribution: []
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [copiedText, setCopiedText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        timeRange: 'all', // all, today, week, month
        sortBy: 'newest', // newest, oldest, tokenId
    });

    // Real-time State
    const [isLive, setIsLive] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const eventListenerRef = useRef(null);
    const providerRef = useRef(null);

    // Chart colors
    const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    // Get provider
    const getProvider = useCallback(() => {
        if (window.ethereum) {
            return new ethers.providers.Web3Provider(window.ethereum);
        }
        return new ethers.providers.JsonRpcProvider("https://1rpc.io/sepolia");
    }, []);

    // Process events into chart data
    const processChartData = (events) => {
        const dailyCounts = {};
        const holderCounts = {};

        events.forEach(event => {
            // Daily counts for trend chart
            const date = new Date(event.timestamp * 1000).toLocaleDateString();
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;

            // Holder distribution
            const holder = event.recipient;
            holderCounts[holder] = (holderCounts[holder] || 0) + 1;
        });

        // Convert to chart format
        const chartData = Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, mints: count }))
            .slice(-14); // Last 14 days

        // Top holders for pie chart
        const holderDistribution = Object.entries(holderCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([address, count]) => ({
                name: `${address.slice(0, 6)}...${address.slice(-4)}`,
                value: count,
                address
            }));

        return { chartData, holderDistribution };
    };

    // Fetch contract stats
    const fetchStats = async () => {
        setLoading(true);
        setError('');

        try {
            const provider = getProvider();
            providerRef.current = provider;

            const network = await provider.getNetwork();
            console.log('Connected:', network.name);

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            let totalSupply = 0;
            try {
                const supply = await contract.totalSupply();
                totalSupply = supply.toNumber();
            } catch (e) {
                console.log('totalSupply failed:', e.message);
            }

            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 50000);

            const filter = contract.filters.Minted();
            const events = await contract.queryFilter(filter, fromBlock, 'latest');
            console.log(`Found ${events.length} events`);

            if (totalSupply === 0) totalSupply = events.length;

            // Fetch transaction details
            const recentMints = await Promise.all(
                events.map(async (event) => {
                    try {
                        const [tx, receipt, block] = await Promise.all([
                            provider.getTransaction(event.transactionHash),
                            provider.getTransactionReceipt(event.transactionHash),
                            event.getBlock()
                        ]);

                        const gasPrice = tx.gasPrice || tx.maxFeePerGas;
                        const txFee = receipt.gasUsed.mul(gasPrice);

                        return {
                            tokenId: event.args.tokenId.toString(),
                            recipient: event.args.recipient,
                            txHash: event.transactionHash,
                            blockNumber: event.blockNumber,
                            timestamp: block.timestamp,
                            from: tx.from,
                            to: tx.to,
                            txFee: ethers.utils.formatEther(txFee),
                            method: 'mint'
                        };
                    } catch (e) {
                        return {
                            tokenId: event.args.tokenId.toString(),
                            recipient: event.args.recipient,
                            txHash: event.transactionHash,
                            blockNumber: event.blockNumber,
                            timestamp: Math.floor(Date.now() / 1000),
                            from: event.args.recipient,
                            to: CONTRACT_ADDRESS,
                            method: 'mint'
                        };
                    }
                })
            );

            const { chartData, holderDistribution } = processChartData(recentMints);

            setStats({
                totalSupply,
                recentMints,
                chartData,
                holderDistribution
            });
        } catch (err) {
            console.error('Error:', err);
            setError('Connect MetaMask to Sepolia to view data.');
        } finally {
            setLoading(false);
        }
    };

    // Start real-time event listening
    const startLiveUpdates = useCallback(async () => {
        if (eventListenerRef.current) return;

        try {
            const provider = getProvider();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            const handleMint = async (recipient, tokenId, nullifier, event) => {
                console.log('🔔 New mint detected!', tokenId.toString());

                const block = await event.getBlock();
                const newMint = {
                    tokenId: tokenId.toString(),
                    recipient,
                    txHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    timestamp: block.timestamp,
                    from: recipient,
                    to: CONTRACT_ADDRESS,
                    method: 'mint',
                    isNew: true
                };

                // Add notification
                const notification = {
                    id: Date.now(),
                    message: `New SBT #${tokenId.toString()} minted!`,
                    address: recipient,
                    time: new Date().toLocaleTimeString()
                };
                setNotifications(prev => [notification, ...prev].slice(0, 10));

                // Update stats
                setStats(prev => ({
                    ...prev,
                    totalSupply: prev.totalSupply + 1,
                    recentMints: [newMint, ...prev.recentMints]
                }));
            };

            contract.on('Minted', handleMint);
            eventListenerRef.current = { contract, handler: handleMint };
            setIsLive(true);
            console.log('✅ Live updates started');
        } catch (err) {
            console.error('Failed to start live updates:', err);
        }
    }, [getProvider]);

    // Stop real-time updates
    const stopLiveUpdates = useCallback(() => {
        if (eventListenerRef.current) {
            const { contract, handler } = eventListenerRef.current;
            contract.off('Minted', handler);
            eventListenerRef.current = null;
            setIsLive(false);
            console.log('⏹ Live updates stopped');
        }
    }, []);

    // Filter and sort transactions
    const getFilteredTransactions = () => {
        let filtered = [...stats.recentMints];

        // Time filter
        const now = Math.floor(Date.now() / 1000);
        if (filters.timeRange === 'today') {
            filtered = filtered.filter(tx => now - tx.timestamp < 86400);
        } else if (filters.timeRange === 'week') {
            filtered = filtered.filter(tx => now - tx.timestamp < 604800);
        } else if (filters.timeRange === 'month') {
            filtered = filtered.filter(tx => now - tx.timestamp < 2592000);
        }

        // Sort
        if (filters.sortBy === 'newest') {
            filtered.sort((a, b) => b.timestamp - a.timestamp);
        } else if (filters.sortBy === 'oldest') {
            filtered.sort((a, b) => a.timestamp - b.timestamp);
        } else if (filters.sortBy === 'tokenId') {
            filtered.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));
        }

        return filtered.slice(0, 20);
    };

    // Search handler
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchResult(null);

        try {
            const provider = getProvider();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            if (ethers.utils.isAddress(searchQuery)) {
                const balance = await contract.balanceOf(searchQuery);
                const filter = contract.filters.Minted(searchQuery);
                const events = await contract.queryFilter(filter);

                setSearchResult({
                    type: 'address',
                    address: searchQuery,
                    balance: balance.toNumber(),
                    tokens: events.map(e => ({
                        tokenId: e.args.tokenId.toString(),
                        txHash: e.transactionHash
                    }))
                });
            } else if (!isNaN(searchQuery)) {
                const owner = await contract.ownerOf(searchQuery);
                setSearchResult({
                    type: 'token',
                    tokenId: searchQuery,
                    owner
                });
            }
        } catch (err) {
            setError((isZh ? '搜索失败：' : 'Search failed: ') + err.message);
        } finally {
            setSearching(false);
        }
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), 2000);
    };

    const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
    const formatHash = (hash) => hash ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : '';

    const formatAge = (timestamp) => {
        const diff = Math.floor(Date.now() / 1000) - timestamp;
        if (isZh) {
            if (diff < 60) return `${diff}秒前`;
            if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
            return `${Math.floor(diff / 86400)}天前`;
        }
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    useEffect(() => {
        fetchStats();
        return () => {
            if (eventListenerRef.current) {
                const { contract, handler } = eventListenerRef.current;
                contract.off('Minted', handler);
            }
        };
    }, []);

    useEffect(() => {
        if (walletSigner) fetchStats();
    }, [walletSigner]);

    const filteredTxs = getFilteredTransactions();

    return (
        <div className="min-h-screen bg-gradient-to-b from-surface-base via-surface-1 to-surface-base pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-theme-text-primary mb-3">
                        GhostLink <span className="text-theme-accent-secondary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-purple-400">{s('Explorer', '浏览')}</span>
                    </h1>
                    <p className="text-theme-text-secondary">{s('Real-time blockchain explorer for SBT credentials', '实时查看链上凭证动向')}</p>
                </motion.div>

                {/* Stats Cards - Restored */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-surface-elevated-1 rounded-2xl p-5 border border-theme-accent-primary/20 shadow-theme-strong">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-theme-accent-primary/10 flex items-center justify-center border border-theme-accent-primary/20">
                                <Award className="w-5 h-5 text-theme-accent-primary" />
                            </div>
                            <div>
                                <div className="text-xs text-theme-text-muted">{s('Total Minted', '已铸造总量')}</div>
                                <div className="text-xl font-bold text-theme-text-primary">
                                    {loading ? <Loader className="w-5 h-5 animate-spin text-theme-accent-primary" /> : stats.totalSupply}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-surface-elevated-1 rounded-2xl p-5 border border-emerald-500/20 shadow-theme-strong">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-xs text-theme-text-muted">{s('Transactions', '交易数')}</div>
                                <div className="text-xl font-bold text-theme-text-primary">
                                    {loading ? <Loader className="w-5 h-5 animate-spin text-emerald-400" /> : stats.recentMints.length}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-surface-elevated-1 rounded-2xl p-5 border border-theme-accent-secondary/20 shadow-theme-strong">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-theme-accent-secondary/10 flex items-center justify-center border border-theme-accent-secondary/20">
                                <Clock className="w-5 h-5 text-theme-accent-secondary" />
                            </div>
                            <div>
                                <div className="text-xs text-theme-text-muted">{s('Network', '网络')}</div>
                                <div className="text-xl font-bold text-theme-text-primary">Sepolia</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className="bg-surface-elevated-1 rounded-2xl p-5 border border-orange-500/20 shadow-theme-strong">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <Wallet className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                            </div>
                            <div>
                                <div className="text-xs text-theme-text-muted">{s('Contract', '合约')}</div>
                                <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                                    className="text-sm font-mono text-theme-accent-primary hover:text-theme-accent-secondary">
                                    {formatAddress(CONTRACT_ADDRESS)}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Controls Bar (Live, Notifications, Refresh) */}
                <div className="flex items-center justify-end gap-3 mb-6">
                    {/* Live Toggle */}
                    <button
                        onClick={() => isLive ? stopLiveUpdates() : startLiveUpdates()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${isLive
                            ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-surface-elevated-1 text-theme-text-muted border border-theme-border-medium hover:border-theme-accent-primary/30'
                            }`}
                    >
                        {isLive ? (
                            <>
                                <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                {s('Live', '实时')}
                            </>
                        ) : (
                            <>
                                <Activity className="w-4 h-4" />
                                {s('Go Live', '开启实时')}
                            </>
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-xl bg-surface-elevated-1 hover:bg-surface-elevated-2 transition-all border border-theme-border-medium cursor-pointer"
                        >
                            <Bell className="w-5 h-5 text-theme-text-muted" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-12 w-72 bg-surface-elevated-2 backdrop-blur-xl rounded-xl shadow-theme-strong border border-theme-border-medium z-50 overflow-hidden"
                                >
                                    <div className="p-3 border-b border-theme-border-medium flex items-center justify-between">
                                        <span className="font-semibold text-theme-text-primary">{s('Notifications', '通知')}</span>
                                        {notifications.length > 0 && (
                                            <button onClick={() => setNotifications([])} className="text-xs text-theme-text-muted hover:text-theme-accent-primary cursor-pointer">
                                                {s('Clear all', '清空')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-theme-text-muted text-sm">{s('No notifications', '暂无通知')}</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-3 border-b border-theme-border-medium hover:bg-surface-elevated-3">
                                                    <div className="text-sm text-theme-text-primary">{n.message}</div>
                                                    <div className="text-xs text-theme-text-muted mt-1">{n.time}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button onClick={fetchStats} disabled={loading} className="p-2 hover:bg-surface-elevated-2 rounded-xl transition-all border border-theme-border-medium bg-surface-elevated-1 cursor-pointer">
                        <RefreshCw className={`w-5 h-5 text-theme-text-muted ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Trend Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-surface-elevated-1 rounded-2xl p-6 border border-theme-border-medium shadow-theme-strong">
                        <h3 className="text-sm font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-theme-accent-primary" />
                            Minting Trend
                        </h3>
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="colorMints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--surface-elevated-2)', color: 'var(--text-primary)' }} />
                                    <Area type="monotone" dataKey="mints" stroke="#6366f1" fillOpacity={1} fill="url(#colorMints)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-theme-text-muted">{s('No data available', '暂无数据')}</div>
                        )}
                    </motion.div>

                    {/* Holder Distribution */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-surface-elevated-1 rounded-2xl p-6 border border-theme-border-medium shadow-theme-strong">
                        <h3 className="text-sm font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-theme-accent-secondary" />
                            {s('Top Holders', '持有人排行')}
                        </h3>
                        {stats.holderDistribution.length > 0 ? (
                            <div className="flex items-center gap-6">
                                <ResponsiveContainer width="50%" height={160}>
                                    <PieChart>
                                        <Pie data={stats.holderDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                                            {stats.holderDistribution.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex-1 space-y-2">
                                    {stats.holderDistribution.map((h, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                            <span className="font-mono text-theme-text-muted">{h.name}</span>
                                            <span className="text-theme-text-primary font-medium ml-auto">{h.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-theme-text-muted">{s('No data available', '暂无数据')}</div>
                        )}
                    </motion.div>
                </div>

                {/* Search + Controls Toolbar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-surface-elevated-1 rounded-2xl p-4 border border-theme-border-medium shadow-theme-strong mb-6 flex flex-wrap gap-4 items-center justify-between">

                    {/* Search Bar */}
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted dark:text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={s('Search by Wallet Address or Token ID...', '输入钱包地址或凭证编号搜索…')}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2
                                     bg-surface-elevated-2 border border-theme-border-medium
                                     text-theme-text-primary placeholder-theme-text-muted
                                     focus:ring-theme-accent-primary/50 focus:border-theme-accent-primary/50
                                     dark:bg-white/[0.06] dark:border-white/15 dark:text-slate-100 dark:placeholder-slate-500
                                     dark:backdrop-blur-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
                                     dark:caret-cyan-300
                                     dark:focus:ring-cyan-500/30 dark:focus:border-cyan-400/50"
                        />
                        {searchResult && (
                            <button
                                onClick={() => { setSearchQuery(''); setSearchResult(null); fetchStats(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted dark:text-slate-400 hover:text-theme-accent-primary cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters & Sort */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-px bg-theme-border-medium hidden md:block"></div>

                        {/* Time Filter Pills */}
                        <div className="flex bg-surface-elevated-2 p-1 rounded-lg border border-theme-border-medium dark:bg-white/[0.06] dark:border-white/15 dark:backdrop-blur-md">
                            {['all', 'today', 'week', 'month'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setFilters(f => ({ ...f, timeRange: range }))}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${filters.timeRange === range
                                        ? 'bg-theme-accent-primary/20 text-theme-accent-primary border border-theme-accent-primary/30'
                                        : 'text-theme-text-muted hover:text-theme-text-primary dark:text-slate-400 dark:hover:text-slate-100'
                                        }`}
                                >
                                    {isZh
                                        ? ({ all: '全部', today: '今天', week: '近一周', month: '近一月' }[range] || range)
                                        : (range.charAt(0).toUpperCase() + range.slice(1))}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative group">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                                className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                                           bg-surface-elevated-2 border border-theme-border-medium text-theme-text-primary
                                           hover:border-theme-accent-primary/30 focus:outline-none focus:ring-2 focus:ring-theme-accent-primary/50
                                           dark:bg-white/[0.06] dark:border-white/15 dark:text-slate-100 dark:backdrop-blur-md
                                           dark:hover:border-cyan-400/30 dark:focus:ring-cyan-500/30 dark:focus:border-cyan-400/50"
                            >
                                <option value="newest">{s('Newest First', '最新优先')}</option>
                                <option value="oldest">{s('Oldest First', '最早优先')}</option>
                                <option value="tokenId">{s('Token ID', '编号')}</option>
                            </select>
                            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted dark:text-slate-400 pointer-events-none" />
                        </div>

                        <button onClick={handleSearch} disabled={searching}
                            className="px-4 py-2 bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary hover:brightness-110 text-white rounded-lg text-sm font-medium transition-all shadow-theme-glow cursor-pointer">
                            {searching ? <Loader className="w-4 h-4 animate-spin" /> : s('Search', '搜索')}
                        </button>
                    </div>
                </motion.div>

                {/* Main Content Area - Switches based on Search Result */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-surface-elevated-1 rounded-2xl border border-theme-border-medium shadow-theme-strong overflow-hidden">

                    {/* Header */}
                    <div className="p-5 border-b border-theme-border-medium flex items-center justify-between bg-surface-elevated-2">
                        <h2 className="font-semibold text-theme-text-primary flex items-center gap-2">
                            {searchResult ? (
                                <>
                                    <Search className="w-4 h-4 text-theme-accent-primary" />
                                    {s('Search Results', '搜索结果')}
                                </>
                            ) : (
                                <>
                                    <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                    {s('Latest Transactions', '最新交易')}
                                </>
                            )}
                        </h2>
                        {!searchResult && (
                            <span className="text-xs text-theme-text-muted font-medium px-2 py-1 bg-surface-elevated-1 border border-theme-border-medium rounded-md">
                                {isZh ? `${filteredTxs.length} 条` : `${filteredTxs.length} items`}
                            </span>
                        )}
                    </div>

                    {/* Search Result View (Address or Token) */}
                    {searchResult ? (
                        <div className="p-6">
                            {searchResult.type === 'address' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-surface-2 p-4 rounded-xl border border-theme-border-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-theme-accent-primary/10 rounded-full flex items-center justify-center text-theme-accent-primary">
                                                <Wallet className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-theme-text-muted mb-1">{s('Wallet Address', '钱包地址')}</div>
                                                <div className="font-mono text-xl font-bold text-theme-text-primary flex items-center gap-2">
                                                    {formatAddress(searchResult.address)}
                                                    <button onClick={() => copyText(searchResult.address)} className="p-1 hover:bg-surface-elevated-2 rounded-full transition-colors">
                                                        {copiedText === searchResult.address ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-theme-text-muted" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-theme-text-muted mb-1">{s('Total Assets', '资产总量')}</div>
                                            <div className="text-2xl font-bold text-theme-accent-secondary">
                                                {isZh ? `${searchResult.balance} 枚凭证` : `${searchResult.balance} SBTs`}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-theme-text-primary mb-3">{s('Owned Tokens', '持有的凭证')}</h3>
                                        {searchResult.tokens.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {searchResult.tokens.map((token) => (
                                                    <div key={token.tokenId} className="flex items-center justify-between p-3 bg-surface-1 border border-theme-border-medium rounded-xl hover:border-theme-accent-primary/50 transition-all shadow-sm group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-surface-elevated-2 rounded-lg flex items-center justify-center text-theme-text-primary">
                                                                <Award className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-theme-text-primary">
                                                                    {isZh ? `凭证 #${token.tokenId}` : `Token #${token.tokenId}`}
                                                                </div>
                                                                <div className="text-xs text-theme-text-muted">{s('GhostLink Credential', '链上凭证')}</div>
                                                            </div>
                                                        </div>
                                                        <a href={`https://sepolia.etherscan.io/tx/${token.txHash}`} target="_blank" rel="noopener noreferrer"
                                                            className="p-2 text-theme-text-muted hover:text-theme-accent-primary opacity-0 group-hover:opacity-100 transition-all">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-theme-text-muted italic">{s('No tokens found for this address.', '该地址暂无凭证')}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResult(null); fetchStats(); }}
                                        className="text-sm text-theme-accent-primary hover:text-theme-accent-secondary font-medium"
                                    >
                                        {s('← Back to Dashboard', '← 返回概览')}
                                    </button>
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto text-center py-8">
                                    <div className="w-20 h-20 bg-surface-elevated-2 rounded-2xl mx-auto flex items-center justify-center text-theme-text-primary mb-6 shadow-theme-strong">
                                        <Award className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-theme-text-primary mb-2">{isZh ? `凭证 #${searchResult.tokenId}` : `Token #${searchResult.tokenId}`}</h3>
                                    <p className="text-theme-text-muted mb-6">{s('GhostLink Identity Credential', 'GhostLink 身份凭证')}</p>

                                    <div className="bg-surface-elevated-2 rounded-xl p-4 border border-theme-border-medium text-left mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-theme-text-muted">{s('Owner', '持有人')}</span>
                                            <div className="font-mono text-theme-text-primary flex items-center gap-2">
                                                {formatAddress(searchResult.owner)}
                                                <button onClick={() => copyText(searchResult.owner)} className="p-1 hover:bg-surface-elevated-3 rounded">
                                                    <Copy className="w-3 h-3 text-theme-text-muted" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-theme-text-muted">{s('Status', '状态')}</span>
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-medium flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> {s('Active', '有效')}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResult(null); fetchStats(); }}
                                        className="text-theme-accent-primary hover:text-theme-accent-secondary font-medium"
                                    >
                                        {s('Back to Explorer', '返回浏览')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Standard View - Transaction Table */
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader className="w-10 h-10 text-theme-accent-primary animate-spin mb-4" />
                                <p className="text-theme-text-muted font-medium">{s('Loading blockchain data...', '正在加载链上数据…')}</p>
                            </div>
                        ) : filteredTxs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-surface-elevated-2 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-theme-text-muted" />
                                </div>
                                <h3 className="text-theme-text-primary font-medium mb-1">{s('No transactions found', '未找到交易')}</h3>
                                <p className="text-theme-text-muted text-sm">{s('Try adjusting your filters or search query.', '可以尝试调整筛选条件或搜索内容')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface-elevated-2 text-theme-text-muted text-xs uppercase tracking-wider border-b border-theme-border-medium">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-medium">{s('Tx Hash', '交易哈希')}</th>
                                            <th className="px-6 py-4 text-left font-medium">{s('Method', '方法')}</th>
                                            <th className="px-6 py-4 text-left font-medium">{s('Block', '区块')}</th>
                                            <th className="px-6 py-4 text-left font-medium">{s('Age', '时间')}</th>
                                            <th className="px-6 py-4 text-left font-medium">{s('From', '发起方')}</th>
                                            <th className="px-6 py-4 text-left font-medium">{s('Token', '凭证')}</th>
                                            <th className="px-6 py-4 text-right font-medium">{s('Fee', '手续费')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border-medium">
                                        {filteredTxs.map((tx, i) => (
                                            <motion.tr
                                                key={tx.txHash}
                                                initial={tx.isNew ? { backgroundColor: 'var(--surface-elevated-3)' } : { opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                className="hover:bg-surface-elevated-2 transition-colors group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-surface-elevated-3 text-theme-text-muted rounded-lg group-hover:bg-theme-accent-primary/20 group-hover:text-theme-accent-primary transition-colors">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer"
                                                            className="text-theme-accent-primary hover:text-theme-accent-secondary font-mono font-medium">
                                                            {formatHash(tx.txHash)}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-semibold uppercase">
                                                        {s('Mint', '铸造')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <a href={`https://sepolia.etherscan.io/block/${tx.blockNumber}`} target="_blank" rel="noopener noreferrer" className="text-theme-accent-primary hover:text-theme-accent-secondary">
                                                        {tx.blockNumber}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-theme-text-muted">
                                                    <span title={new Date(tx.timestamp * 1000).toLocaleString()}>
                                                        {formatAge(tx.timestamp)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-theme-accent-primary to-theme-accent-secondary"></div>
                                                        <a href={`https://sepolia.etherscan.io/address/${tx.from}`} target="_blank" rel="noopener noreferrer"
                                                            className="text-theme-accent-primary hover:text-theme-accent-secondary font-mono">
                                                            {formatAddress(tx.from)}
                                                        </a>
                                                        <button onClick={() => copyText(tx.from)} className="opacity-0 group-hover:opacity-100 text-theme-text-muted hover:text-theme-accent-primary transition-opacity cursor-pointer">
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-semibold">
                                                        <Award className="w-3 h-3" />
                                                        SBT #{tx.tokenId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-theme-text-muted font-mono">
                                                    {tx.txFee ? (
                                                        <span className="px-2 py-1 bg-surface-elevated-3 rounded border border-theme-border-medium">
                                                            {parseFloat(tx.txFee).toFixed(6)} ETH
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </motion.div>
            </div>
        </div>
    );
};
