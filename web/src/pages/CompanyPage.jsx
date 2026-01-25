export const CompanyPage = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
            {/* Manifesto */}
            <section className="text-center py-20 mb-20">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-text mb-8">
                    Data is Property.
                </h1>
                <p className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto font-light">
                    We believe that in the digital age, privacy is not about secrecy, but about <span className="text-accent">control</span>.
                    GhostLink builds the bridge for true data ownership.
                </p>
            </section>

            {/* Roadmap */}
            <section className="max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-12 text-center">Master Plan</h3>
                <div className="relative border-l-2 border-gray-100 ml-6 md:ml-0 space-y-16 pl-8 md:pl-12">
                    {[
                        { date: 'Q1 2026', title: 'MVP Launch', desc: 'GitHub Passport & Basic SDK release.', active: true },
                        { date: 'Q2 2026', title: 'SDK for dApps', desc: 'Plug-and-play components for React & Vue.', active: false },
                        { date: 'Q3 2026', title: 'Data Staking Economy', desc: 'Earn yield by verifying your own data.', active: false },
                    ].map((item, index) => (
                        <div key={index} className="relative group">
                            <div className={`absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full border-4 border-white ${item.active ? 'bg-accent shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'bg-gray-200'
                                }`}></div>
                            <span className="text-sm font-mono text-accent mb-1 block">{item.date}</span>
                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                            <p className="text-text-muted">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
