'use client';

import { useState } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function LoveCalculator() {
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- ❤️ LOVE LOGIC (Fun Algorithm) ---
    const calculateLove = () => {
        if (!name1 || !name2) return;

        setLoading(true);
        setResult(null);

        // Thoda fake delay taki calculation "Real" lage
        setTimeout(() => {
            // Simple logic: Names ke characters ka sum karke % nikalna
            const combined = (name1 + name2).toLowerCase();
            let sum = 0;
            for (let i = 0; i < combined.length; i++) {
                sum += combined.charCodeAt(i);
            }
            const percentage = sum % 101; // 0 to 100

            let message = "";
            if (percentage > 90) message = "💖 Soulmates! Shadi kab hai?";
            else if (percentage > 70) message = "🔥 Hot Couple!";
            else if (percentage > 40) message = "🙂 Good Friends maybe?";
            else message = "💀 Run away! Toxic alert.";

            setResult({ percentage, message });
            setLoading(false);

            // Mobile pe result pe scroll karo - REMOVED
            // if (window.innerWidth < 768) {
            //     document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
            // }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-pink-50 relative font-sans pb-20 overflow-hidden">

            {/* Background Hearts Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#f472b6 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-300 rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-300 rounded-full blur-[150px] opacity-20 translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 md:pt-10">

                {/* --- HEADER --- */}
                <div className="text-center mb-10 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-[10px] md:text-xs font-bold mb-4 uppercase tracking-wider">
                        <span>💘</span> AI Matchmaker
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
                        Love <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">Tester</span>
                    </h1>
                    <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto">
                        Enter two names to scientifically calculate your compatibility score.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                    {/* LEFT: INPUTS */}
                    <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white shadow-2xl shadow-pink-100/50 flex flex-col justify-center">

                        <div className="space-y-8">
                            <div className="relative group">
                                <label className="text-xs font-bold text-pink-400 uppercase tracking-wider block mb-2 ml-1">Your Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">👤</span>
                                    <input
                                        type="text"
                                        placeholder="e.g. Romeo"
                                        value={name1}
                                        onChange={(e) => setName1(e.target.value)}
                                        className="w-full pl-12 pr-4 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl font-bold text-lg text-slate-800 outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-200 transition-all placeholder-pink-300/70"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center -my-2 relative z-10">
                                <div className="bg-white p-3 rounded-full shadow-md border border-pink-100 text-2xl animate-pulse">
                                    ❤️
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-xs font-bold text-pink-400 uppercase tracking-wider block mb-2 ml-1">Partner's Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">✨</span>
                                    <input
                                        type="text"
                                        placeholder="e.g. Juliet"
                                        value={name2}
                                        onChange={(e) => setName2(e.target.value)}
                                        className="w-full pl-12 pr-4 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl font-bold text-lg text-slate-800 outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-200 transition-all placeholder-pink-300/70"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={calculateLove}
                                disabled={loading || !name1 || !name2}
                                className="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="relative z-10">{loading ? "Calculating..." : "Check Compatibility 💘"}</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </div>

                    </div>

                    {/* RIGHT: RESULT */}
                    <div id="result-area" className="bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-pink-100 shadow-xl flex flex-col items-center justify-center min-h-[500px] relative text-center">

                        {loading ? (
                            // Loading Heart Animation
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-20 animate-pulse"></div>
                                <div className="text-8xl mb-6 animate-heartbeat drop-shadow-2xl">💓</div>
                                <p className="font-bold text-xl text-slate-700 animate-pulse">Analyzing vibes...</p>
                            </div>
                        ) : result ? (
                            // Final Result
                            <div className="relative z-10 animate-fade-in-up w-full flex flex-col items-center">
                                <p className="text-pink-400 font-bold uppercase text-xs tracking-[0.2em] mb-8 bg-pink-50 px-4 py-1 rounded-full">Compatibility Score</p>

                                <div className="relative w-64 h-64 flex items-center justify-center mb-8 group">
                                    {/* Glowing background */}
                                    <div className="absolute inset-0 bg-pink-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

                                    {/* Circle Borders */}
                                    <div className="absolute inset-0 rounded-full border-[12px] border-pink-50"></div>
                                    <div className="absolute inset-0 rounded-full border-[12px] border-pink-500 border-t-transparent border-l-transparent animate-spin-slow opacity-80"></div>

                                    <div className="text-7xl font-black text-slate-900 tracking-tighter">
                                        {result.percentage}<span className="text-4xl text-pink-500 align-top">%</span>
                                    </div>
                                </div>

                                <div className="max-w-md bg-pink-50/80 p-6 rounded-3xl border border-pink-100">
                                    <h2 className="text-3xl font-bold text-slate-800 mb-2">{result.message}</h2>
                                    <p className="text-slate-500 font-medium">Relationship forecast for <br /> <span className="text-pink-600 border-b border-pink-200">{name1}</span> & <span className="text-pink-600 border-b border-pink-200">{name2}</span></p>
                                </div>

                                <button onClick={() => { setName1(''); setName2(''); setResult(null) }} className="mt-8 text-pink-500 font-bold text-sm hover:text-pink-600 transition-colors flex items-center gap-2 group">
                                    <span>↺</span> Check Another Couple
                                </button>
                            </div>
                        ) : (
                            // Empty State
                            <div className="text-center opacity-40 select-none">
                                <div className="text-9xl mb-6 grayscale opacity-50 scale-90">💘</div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Match?</h3>
                                <p className="text-slate-500">Enter names to discover your fate.</p>
                            </div>
                        )}

                        {/* Decoration */}
                        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-[80px] opacity-40"></div>
                    </div>

                </div>

                {/* Ad Space */}
                <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
                    <AdUnit />
                </div>

                {/* SEO Content */}
                <article className="mt-24 prose prose-pink max-w-2xl mx-auto text-center text-slate-400 text-sm">
                    <p>This Love Calculator uses a numeric algorithm based on the characters of your names to determine potential compatibility. Results are for entertainment purposes only.</p>
                </article>

            </div>
        </div>
    )
}