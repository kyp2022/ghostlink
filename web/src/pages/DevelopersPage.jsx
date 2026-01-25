import { Github, Twitter, Globe } from 'lucide-react';

export const DevelopersPage = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
            {/* Integration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
                <div className="sticky top-32">
                    <h2 className="text-4xl font-bold mb-6">Import. Verify. Mint.</h2>
                    <p className="text-text-muted text-lg mb-8">
                        Use our Rust SDK to build custom data parsers.
                        Define verification logic in standard Rust, and we handle the ZK circuit compilation.
                    </p>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-accent">1</div>
                            <span className="font-medium">Install Rust SDK</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-accent">2</div>
                            <span className="font-medium">Write Parser Logic</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-accent">3</div>
                            <span className="font-medium">Deploy to GhostLink Network</span>
                        </div>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden font-mono text-sm">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        </div>
                        <span className="ml-4 text-xs text-gray-500">main.rs</span>
                    </div>
                    <div className="p-6 overflow-x-auto text-gray-800 leading-relaxed">
                        <div><span className="text-purple-600">use</span> ghostlink_sdk::prelude::*;</div>
                        <br />
                        <div><span className="text-blue-600">fn</span> <span className="text-yellow-600">main</span>() {'{'}</div>
                        <div className="pl-4"><span className="text-gray-400">// Read data from host</span></div>
                        <div className="pl-4"><span className="text-purple-600">let</span> input: <span className="text-yellow-600">String</span> = env::<span className="text-blue-600">read</span>();</div>
                        <br />
                        <div className="pl-4"><span className="text-gray-400">// Verify JSON structure</span></div>
                        <div className="pl-4"><span className="text-purple-600">let</span> data: <span className="text-yellow-600">PayPalData</span> = serde_json::<span className="text-blue-600">from_str</span>(&input).unwrap();</div>
                        <br />
                        <div className="pl-4"><span className="text-purple-600">if</span> data.balance &gt; <span className="text-blue-600">1000.0</span> {'{'}</div>
                        <div className="pl-8">env::<span className="text-blue-600">commit</span>("<span className="text-green-600">SOLVENT</span>");</div>
                        <div className="pl-4">{'}'}</div>
                        <div>{'}'}</div>
                    </div>
                </div>
            </div>

            {/* Marketplace */}
            <div>
                <h3 className="text-2xl font-bold mb-8">Parser Marketplace</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { name: 'GitHub', status: 'Live', color: 'bg-green-100 text-green-700' },
                        { name: 'Twitter', status: 'Live', color: 'bg-green-100 text-green-700' },
                        { name: 'Alipay', status: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
                        { name: 'Steam', status: 'Live', color: 'bg-green-100 text-green-700' },
                    ].map((item) => (
                        <div key={item.name} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                {item.name === 'GitHub' ? <Github size={24} /> :
                                    item.name === 'Twitter' ? <Twitter size={24} /> :
                                        <Globe size={24} />}
                            </div>
                            <span className="font-semibold">{item.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.color}`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
