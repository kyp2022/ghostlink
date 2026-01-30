import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Check, Shield, FileText, Users, Target } from 'lucide-react';

// Typewriter hook
const useTypewriter = (text, speed = 50) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayedText, isComplete };
};

// Verified Identity Node Component
const IdentityNode = ({ name, role, verified, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative bg-surface-1 border border-theme-border-medium rounded-xl p-6 cursor-pointer overflow-hidden shadow-theme-strong"
        >
            {/* Holographic border effect on hover - Dark Mode Only */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden dark:block">
                <div className="holographic-border absolute inset-0 rounded-xl" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Corner clip effect */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-theme-accent-primary/20 transform rotate-45 blur-sm" />

                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-theme-accent-primary/10 flex items-center justify-center border border-theme-accent-primary/20">
                        <Users className="w-6 h-6 text-theme-accent-primary" />
                    </div>
                    {verified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono text-emerald-500 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>VERIFIED</span>
                        </div>
                    )}
                </div>

                <h4 className="text-theme-text-primary font-bold text-sm mb-1 font-professional">{name}</h4>
                <p className="text-theme-text-muted text-sm font-professional">{role}</p>
            </div>

            {/* Glow effect on hover - Dark Mode Only */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 glow-cyan-subtle transition-opacity duration-500 pointer-events-none hidden dark:block" />
        </motion.div>
    );
};

// Mission Log Item Component
const MissionLog = ({ date, title, desc, status, index }) => {
    const isActive = status === 'active';
    const isComplete = status === 'complete';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group"
        >
            {/* Status indicator */}
            <div className={`absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full border-4 
                ${isComplete ? 'bg-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                    isActive ? 'bg-theme-accent-secondary border-theme-accent-secondary/30 dark:shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse' :
                        'bg-surface-2 border-theme-border-medium'}`}
            />

            {/* Content */}
            <div className={`bg-surface-1 border border-theme-border-medium rounded-lg p-4 transition-all duration-300
                            ${isActive ? 'shadow-theme-glow border-theme-accent-secondary/30' : 'hover:border-theme-border-strong'}`}>
                <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-theme-accent-primary bg-theme-accent-primary/10 px-2 py-1 rounded border border-theme-accent-primary/20">{date}</span>
                    {isActive && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-theme-accent-secondary/10 border border-theme-accent-secondary/30 rounded text-xs font-mono text-theme-accent-secondary">
                            <div className="w-1.5 h-1.5 bg-theme-accent-secondary rounded-full animate-pulse" />
                            <span>ACTIVE</span>
                        </div>
                    )}
                </div>
                <h4 className="text-theme-text-primary font-bold mb-2 font-mono text-base">{title}</h4>
                <p className="text-theme-text-secondary text-sm leading-relaxed font-professional">{desc}</p>
            </div>
        </motion.div>
    );
};

export const CompanyPage = () => {
    const missionRef = useRef(null);
    const isInView = useInView(missionRef, { once: true, margin: "-100px" });

    const missionText = "We believe that in the digital age, privacy is not about secrecy, but about control. GhostLink builds the bridge for true data ownership.";
    const { displayedText, isComplete } = useTypewriter(isInView ? missionText : '', 30);

    return (
        <div className="min-h-screen bg-gradient-to-b from-surface-base via-surface-1 to-surface-base pt-32 pb-20 px-6 max-w-7xl mx-auto font-professional">
            {/* Classified Dossier Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-12 mb-20 relative"
            >
                {/* File Access Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-mono text-emerald-600 dark:text-emerald-400 shadow-sm"
                >
                    <Shield className="w-4 h-4" />
                    <span>FILE ACCESS: AUTHORIZED</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                </motion.div>

                {/* Main manifesto */}
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 text-theme-text-primary">
                    Data is Property.
                </h1>

                {/* Typewriter mission statement */}
                <div ref={missionRef} className="max-w-3xl mx-auto relative">
                    <div className="bg-surface-1 border border-theme-border-medium rounded-xl p-8 shadow-theme-strong relative overflow-hidden">
                        {/* Light mode grid background for this specific card */}
                        <div className="absolute inset-0 bg-theme-grid-pattern opacity-10 pointer-events-none" />

                        <FileText className="w-8 h-8 text-theme-accent-primary mx-auto mb-4 relative z-10" />
                        <p className={`relative z-10 text-lg md:text-xl text-theme-text-primary leading-relaxed ${!isComplete ? 'typewriter-cursor' : ''}`}>
                            {displayedText}
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Team: Verified Identity Nodes */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-20"
            >
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <Target className="w-6 h-6 text-theme-accent-secondary" />
                    <h3 className="text-2xl font-bold text-theme-text-primary font-mono">VERIFIED_PERSONNEL</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <IdentityNode name="Core Team" role="Protocol Development" verified delay={0} />
                    <IdentityNode name="Security Auditors" role="Smart Contract Security" verified delay={0.1} />
                    <IdentityNode name="Research Partners" role="ZK Cryptography" verified delay={0.2} />
                </div>
            </motion.section>

            {/* Roadmap: Mission Logs */}
            <section className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-12 justify-center">
                    <FileText className="w-6 h-6 text-theme-accent-primary" />
                    <h3 className="text-2xl font-bold text-theme-text-primary font-mono">MISSION_LOGS</h3>
                </div>

                <div className="relative border-l-2 border-dashed border-theme-border-medium ml-6 md:ml-0 space-y-6 pl-8 md:pl-12">
                    <MissionLog
                        date="Q1 2026"
                        title="Phase Alpha: MVP Launch"
                        desc="Deploy GitHub Passport authentication and foundational SDK release. Establish secure verification infrastructure with RISC Zero integration."
                        status="active"
                        index={0}
                    />
                    <MissionLog
                        date="Q2 2026"
                        title="Phase Beta: SDK Ecosystem"
                        desc="Launch plug-and-play ZK components for React & Vue frameworks. Enable seamless dApp integration with comprehensive developer tooling and documentation."
                        status="pending"
                        index={1}
                    />
                    <MissionLog
                        date="Q3 2026"
                        title="Phase Gamma: Data Staking Economy"
                        desc="Introduce economic layer enabling users to earn yield through data verification. Revolutionary model where privacy generates sustainable returns."
                        status="pending"
                        index={2}
                    />
                </div>
            </section>
        </div>
    );
};
