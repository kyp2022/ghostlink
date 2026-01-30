import { motion } from 'framer-motion';
import { Cpu, Smartphone, Blocks, Zap, Shield, Lock, ArrowRight, Check, Github, CreditCard, Wallet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

// Scroll Reveal Component with De-pixelation effect (Dark Mode)
const Reveal = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

// Light Mode Scroll Reveal - Crisp slide
const RevealLight = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

// ============================================================================
// DARK MODE COMPONENTS (Original)
// ============================================================================

// Animated geometric prism for hero section (Dark Mode)
const ZKPrismHero = () => {
    return (
        <div className="relative h-[600px] w-full flex items-center justify-center 
                      bg-gradient-to-br from-surface-1 via-surface-base to-surface-1 
                      rounded-3xl overflow-hidden 
                      border border-theme-accent-primary/20 
                      shadow-theme-strong">
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(var(--accent-primary) 1px, transparent 1px),
                        linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />
            <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 z-20"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
            />
            <motion.div
                className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="relative z-10 flex items-center gap-12 scale-90 md:scale-100">
                <div className="relative w-48 h-48 z-10">
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-[30px] blur-xl" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 
                                      bg-gradient-to-br from-slate-800/80 via-cyan-900/20 to-purple-900/20 
                                      backdrop-blur-xl 
                                      border border-cyan-500/30 
                                      rounded-[30px] 
                                      shadow-[0_0_40px_rgba(0,255,255,0.2),inset_0_0_60px_rgba(0,255,255,0.05)]
                                      transform rotate-45" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Cpu size={48} strokeWidth={1} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                        </motion.div>
                    </div>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                                  font-mono text-xs text-cyan-400 font-medium tracking-wider 
                                  bg-surface-1/90 px-4 py-2 rounded-lg border border-theme-border-medium
                                  shadow-theme-glow">
                        ZK_CIRCUIT
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// LIGHT MODE COMPONENTS - "The Daylight Blueprint"
// ============================================================================

// Technical Grid Background Pattern (CSS-based)
const BlueprintGridBackground = () => (
    <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
            backgroundImage: `
                linear-gradient(#64748b 1px, transparent 1px),
                linear-gradient(90deg, #64748b 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
        }}
    />
);

// Live Protocol Status Bar (Bloomberg-style single line)
const ProtocolStatusBar = () => {
    return (
        <div className="w-full bg-slate-900 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-8 font-mono text-xs tracking-wider">
                    <span className="flex items-center gap-2 text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        STATUS: OPERATIONAL
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">
                        PROOFS_GENERATED: <span className="text-white font-semibold">12,847</span>
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">
                        AVG_VERIFY_TIME: <span className="text-white font-semibold">~2.3s</span>
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">
                        ACTIVE_SBT: <span className="text-white font-semibold">3,291</span>
                    </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 tracking-widest">
                    NETWORK::SEPOLIA_LIVE
                </span>
            </div>
        </div>
    );
};

// Hero Visualization Panel with Blueprint Grid
const HeroVisualization = () => (
    <div className="relative w-full h-full min-h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Technical Grid Background */}
        <BlueprintGridBackground />

        {/* Corner Technical Marks */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l border-t border-slate-300" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r border-t border-slate-300" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l border-b border-slate-300" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-slate-300" />

        {/* Document ID */}
        <div className="absolute top-3 left-12 text-[9px] font-mono text-slate-400 tracking-widest">
            DOC::ZK_BRIDGE_SCHEMATIC_v3.2
        </div>

        {/* Generated Image */}
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center p-6"
        >
            <img
                src="/images/zk_bridge_blueprint.png"
                alt="ZK Bridge Blueprint"
                className="max-w-full max-h-full object-contain drop-shadow-sm"
            />
        </motion.div>

        {/* Bottom Status */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] font-mono text-slate-400">
            <span>PROTOCOL::GHOSTLINK</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>CHAIN::ETHEREUM</span>
        </div>
    </div>
);

// Mechanism Flow Step Component
const MechanismStep = ({ step, icon, title, subtitle, description, delay, isCenter = false }) => (
    <RevealLight delay={delay} className="relative">
        <div className={`
            h-full p-6 rounded-xl border transition-all duration-200
            ${isCenter
                ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}
        `}>
            {/* Step Badge */}
            <div className={`
                absolute -top-2.5 left-5 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded
                ${isCenter
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-slate-900 text-white'}
            `}>
                {step}
            </div>

            {/* Icon */}
            <div className={`
                w-16 h-16 mb-4 flex items-center justify-center rounded-lg
                ${isCenter ? 'bg-slate-800' : 'bg-slate-50'}
            `}>
                <img
                    src={icon}
                    alt={title}
                    className={`w-12 h-12 object-contain ${isCenter ? 'invert opacity-90' : ''}`}
                />
            </div>

            {/* Content */}
            <h3 className={`text-sm font-mono font-bold tracking-wide mb-1 ${isCenter ? 'text-amber-400' : 'text-slate-900'}`}>
                {title}
            </h3>
            <p className={`text-xs font-mono mb-3 ${isCenter ? 'text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
            </p>
            <p className={`text-sm leading-relaxed ${isCenter ? 'text-slate-300' : 'text-slate-600'}`}>
                {description}
            </p>
        </div>
    </RevealLight>
);

// SVG Connection Lines between mechanism steps
const FlowConnectors = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
        {/* Left to Center connector */}
        <motion.line
            x1="33%" y1="50%" x2="36%" y2="50%"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.polygon
            points="280,95 290,100 280,105"
            fill="#CBD5E1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.5 }}
            style={{ transform: 'translate(7%, 0)' }}
        />

        {/* Center to Right connector */}
        <motion.line
            x1="64%" y1="50%" x2="67%" y2="50%"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
        />
        <motion.polygon
            points="520,95 530,100 520,105"
            fill="#CBD5E1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.7 }}
            style={{ transform: 'translate(17%, 0)' }}
        />
    </svg>
);

// Use Case Card (Physical Folder Style)
const UseCaseCard = ({ id, title, subtitle, description, tag, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group"
    >
        {/* Color Tab */}
        <div className={`h-1.5 ${color === 'amber' ? 'bg-amber-400' :
            color === 'emerald' ? 'bg-emerald-500' :
                'bg-slate-900'
            }`} />

        <div className="p-5">
            <div className="text-[8px] font-mono text-slate-400 tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                {tag}
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-slate-700 transition-colors">
                {title}
            </h3>
            <p className="text-[11px] font-mono text-slate-500 mb-3">
                {subtitle}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {description}
            </p>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:gap-2.5 transition-all">
                Learn More <ArrowRight size={12} />
            </div>
        </div>
    </motion.div>
);

// Code Preview Terminal (GitHub Light style)
const CodePreview = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Editor Header */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <span className="text-[11px] font-mono text-slate-500">proof_inspector.rs</span>
        </div>

        {/* Code Content */}
        <div className="p-5 font-mono text-[13px] leading-relaxed overflow-x-auto">
            <div className="text-slate-400">// GhostLink Proof Inspector</div>
            <div className="mt-2">
                <span className="text-purple-600">struct</span>{' '}
                <span className="text-amber-600">ProofOutput</span> {'{'}
            </div>
            <div className="pl-4 text-slate-700">
                claim: <span className="text-emerald-600">String</span>,
            </div>
            <div className="pl-4 text-slate-700">
                verified: <span className="text-emerald-600">bool</span>,
            </div>
            <div className="text-slate-700">{'}'}</div>
            <div className="mt-3 text-slate-400">// Zero-knowledge verification</div>
            <div>
                <span className="text-purple-600">fn</span>{' '}
                <span className="text-blue-600">verify</span>(journal: &[u8]) {'{'}
            </div>
            <div className="pl-4 text-slate-700">
                risc0_zkvm::verify(<span className="text-emerald-600">IMAGE_ID</span>, journal)
            </div>
            <div className="text-slate-700">{'}'}</div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Rust • UTF-8</span>
            <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                <Check size={10} /> VERIFIED_BY_RISC0
            </span>
        </div>
    </div>
);

// ============================================================================
// MAIN HOMEPAGE COMPONENT
// ============================================================================

export const HomePage = ({ onConnectWallet, onViewDemo }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // ========================================================================
    // LIGHT MODE: "The Daylight Blueprint" - High-Resolution Protocol Showcase
    // ========================================================================
    if (isLight) {
        return (
            <div className="min-h-screen bg-white relative">
                {/* Global Blueprint Grid Overlay */}
                <BlueprintGridBackground />

                {/* Protocol Status Bar (Data Density Header) */}
                <ProtocolStatusBar />

                {/* HERO SECTION: Split-Panel Design */}
                <section className="px-8 py-16 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Panel: Typography */}
                        <div className="space-y-6">
                            {/* Technical Label */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                                <span className="text-[10px] font-mono text-slate-500 tracking-widest">
                                    PROTOCOL::GHOSTLINK_V3
                                </span>
                            </div>

                            {/* Massive Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 leading-[1.1] tracking-tight">
                                Bridging Web2 Data with Zero-Knowledge Privacy.
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                                Transform your <strong className="font-semibold text-slate-900">real-world credentials</strong> into
                                verifiable on-chain identity without exposing sensitive data.
                                Built on RISC Zero zkVM.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-4 pt-2">
                                <button
                                    onClick={onConnectWallet}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold text-sm
                                             shadow-sm hover:shadow-md hover:bg-slate-800
                                             transition-all duration-200 cursor-pointer flex items-center gap-2"
                                >
                                    <Zap size={16} className="text-amber-400" />
                                    Start Bridging
                                </button>
                                <button
                                    onClick={onViewDemo}
                                    className="px-6 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg font-semibold text-sm
                                             hover:bg-slate-50 hover:border-slate-400
                                             transition-all duration-200 cursor-pointer"
                                >
                                    Read Docs →
                                </button>
                            </div>
                        </div>

                        {/* Right Panel: Visualization */}
                        <HeroVisualization />
                    </div>
                </section>

                {/* HOW IT WORKS: Mechanism Flow (3-Column with SVG Connectors) */}
                <section className="px-8 py-20 border-t border-slate-200">
                    <div className="max-w-5xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-3">
                                The ZK-Protocol Mechanism
                            </h2>
                            <p className="text-2xl font-bold text-slate-900">
                                From Private Data to Public Verification
                            </p>
                        </div>

                        {/* 3-Column Grid with Connectors */}
                        <div className="relative">
                            {/* SVG Connectors (visible on md+) */}
                            <div className="hidden md:block">
                                <FlowConnectors />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
                                <MechanismStep
                                    step="STEP_01"
                                    icon="/images/icon_privacy_shielding.png"
                                    title="PRIVACY_SHIELDING"
                                    subtitle="Input Layer"
                                    description="Your data stays on your device. TLS encryption preserves privacy throughout the entire process."
                                    delay={0}
                                />
                                <MechanismStep
                                    step="STEP_02"
                                    icon="/images/icon_risc_zero_compute.png"
                                    title="RISC_ZERO_COMPUTE"
                                    subtitle="Processing Layer"
                                    description="RISC Zero zkVM generates a mathematical proof in an isolated, verifiable environment."
                                    delay={0.15}
                                    isCenter={true}
                                />
                                <MechanismStep
                                    step="STEP_03"
                                    icon="/images/icon_verifiable_credential.png"
                                    title="VERIFIABLE_CREDENTIAL"
                                    subtitle="Output Layer"
                                    description="Soulbound Token minted on-chain. Publicly verifiable, composable across DeFi protocols."
                                    delay={0.3}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* USE CASES: Asymmetrical Grid */}
                <section className="px-8 py-20 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Use Cases</h2>
                                <p className="text-sm text-slate-500">Modular protocols for verification needs</p>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 tracking-widest">
                                PROTOCOL_SUITE::V3
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <UseCaseCard
                                id="defi"
                                title="DeFi Access"
                                subtitle="Asset-Pass Protocol"
                                description="Prove solvency without exposing balances. Enable under-collateralized lending."
                                tag="ID_7382_GHOST"
                                color="slate"
                                delay={0}
                            />
                            <UseCaseCard
                                id="growth"
                                title="Sybil Prevention"
                                subtitle="Guard Protocol"
                                description="Verify unique human identity through spending patterns without revealing transactions."
                                tag="ID_4291_GUARD"
                                color="amber"
                                delay={0.1}
                            />
                            <UseCaseCard
                                id="identity"
                                title="Identity Bridge"
                                subtitle="Social Credentials"
                                description="Link GitHub, Twitter to on-chain identity. Portable reputation across platforms."
                                tag="ID_8847_BRIDGE"
                                color="emerald"
                                delay={0.2}
                            />
                        </div>
                    </div>
                </section>

                {/* DEVELOPER SECTION: Code Preview */}
                <section className="px-8 py-20 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-5">
                            <div className="text-[9px] font-mono text-slate-400 tracking-widest">
                                DEV_TOOLS::SDK
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Developer-First Design
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                GhostLink provides a Rust SDK for seamless integration.
                                Verify proofs directly in your smart contracts with minimal gas overhead.
                            </p>
                            <ul className="space-y-2.5 text-sm text-slate-600">
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600" />
                                    Open-source SDK on GitHub
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600" />
                                    12ms average proof generation
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-600" />
                                    Composable with any EVM chain
                                </li>
                            </ul>
                        </div>
                        <CodePreview />
                    </div>
                </section>

                {/* TRUST SECTION */}
                <section className="px-8 py-12 border-t border-slate-200">
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-[10px] font-mono text-slate-400 tracking-widest mb-6">
                            TRUSTED_INFRASTRUCTURE
                        </p>
                        <div className="flex flex-wrap justify-center gap-10 text-base font-bold font-mono text-slate-300">
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">RISC_ZERO</span>
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">ETHEREUM</span>
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">TLS_NOTARY</span>
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">STARKWARE</span>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // ========================================================================
    // DARK MODE: "Shadow Protocol" - Original Cyberpunk Layout
    // ========================================================================
    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <section className="pt-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    {/* Status badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 
                                 bg-surface-2/50 border border-theme-border-medium rounded-full 
                                 text-xs font-mono text-theme-accent-primary 
                                 shadow-theme-glow"
                    >
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-theme-glow" />
                        NETWORK::LIVE_ON_SEPOLIA
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-theme-text-primary"
                    >
                        <span>Prove it's you,</span>
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent
                                       bg-[length:200%_auto] animate-[shine_3s_linear_infinite]">
                            without revealing who you are.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-theme-text-secondary max-w-md leading-relaxed font-light"
                    >
                        GhostLink transforms your <span className="text-cyan-400 font-semibold">GitHub</span>,
                        <span className="text-cyan-400 font-semibold"> Alipay</span>, and <span className="text-cyan-400 font-semibold">wallet history</span> into
                        verifiable on-chain credentials.
                        <span className="block mt-2 text-theme-text-primary font-medium">
                            Private. Verifiable. Built on RISC Zero.
                        </span>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-4"
                    >
                        <button
                            onClick={onConnectWallet}
                            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 
                                     text-white rounded-xl font-medium 
                                     shadow-[0_0_30px_rgba(0,255,255,0.3)]
                                     hover:shadow-[0_0_50px_rgba(0,255,255,0.5)]
                                     transition-all duration-300 cursor-pointer
                                     flex items-center gap-2"
                        >
                            <Zap size={18} className="group-hover:animate-pulse" />
                            Connect Wallet
                        </button>
                        <button
                            onClick={onViewDemo}
                            className="px-8 py-4 bg-surface-1 border border-theme-border-strong 
                                     text-cyan-400 rounded-xl font-medium 
                                     hover:bg-surface-2
                                     shadow-theme-glow
                                     transition-all duration-300 cursor-pointer"
                        >
                            View Demo →
                        </button>
                    </motion.div>
                </div>

                {/* Hero Visual */}
                <div className="relative">
                    <ZKPrismHero />
                </div>
            </section>

            {/* Architecture Section */}
            <section className="px-6 max-w-7xl mx-auto mt-32">
                <Reveal delay={0.2}>
                    <div className="bg-surface-1/50 rounded-3xl p-16 border border-theme-border-subtle 
                                  shadow-theme-strong relative overflow-hidden">
                        <div
                            className="absolute inset-0 pointer-events-none opacity-5"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)',
                                backgroundSize: '60px 100%'
                            }}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-slate-700 
                                              shadow-theme-glow
                                              group-hover:border-cyan-500/50 group-hover:shadow-theme-strong
                                              transition-all duration-300">
                                    <Smartphone size={32} className="text-theme-text-muted group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <h3 className="font-semibold text-lg text-theme-text-primary font-mono">USER_LOCAL</h3>
                                <p className="text-sm text-theme-text-muted">
                                    Data stays on your device.<br />TLS encryption intact.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-cyan-500/30 
                                              shadow-theme-glow
                                              group-hover:shadow-theme-strong
                                              transition-all duration-300">
                                    <Cpu size={32} className="text-cyan-400" />
                                </div>
                                <h3 className="font-semibold text-lg text-cyan-400 font-mono">ZK_PROCESSOR</h3>
                                <p className="text-sm text-theme-text-muted">
                                    Mathematical proof generated<br />in isolated RISC Zero environment.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl 
                                              flex items-center justify-center 
                                              border border-slate-700 
                                              shadow-theme-glow
                                              group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]
                                              transition-all duration-300">
                                    <Blocks size={32} className="text-theme-text-muted group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="font-semibold text-lg text-theme-text-primary font-mono">BLOCKCHAIN</h3>
                                <p className="text-sm text-theme-text-muted">
                                    Public verification.<br />Smart contract composability.
                                </p>
                            </motion.div>
                        </div>

                        <div className="absolute top-[35%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent hidden md:block">
                            <motion.div
                                animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="w-20 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            />
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Trust Section */}
            <section className="text-center py-32">
                <Reveal delay={0.4}>
                    <p className="text-sm font-mono tracking-widest text-theme-text-muted mb-8">TRUSTED_INFRASTRUCTURE</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 hover:opacity-80 transition-opacity duration-500">
                        <span className="text-xl font-bold font-mono text-cyan-400">RISC_ZERO</span>
                        <span className="text-xl font-bold font-mono text-purple-400">ETHEREUM</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">TLS_NOTARY</span>
                        <span className="text-xl font-bold font-mono text-cyan-400">STARKWARE</span>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};

export default HomePage;
