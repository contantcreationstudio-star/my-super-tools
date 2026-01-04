'use client';

import { useState, useEffect } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function IdealWeightCalculator() {
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState(25);
    const [unit, setUnit] = useState('cm'); // 'cm' or 'ft'
    const [heightCm, setHeightCm] = useState(170);
    const [heightFt, setHeightFt] = useState(5);
    const [heightIn, setHeightIn] = useState(7);

    // Result state
    const [results, setResults] = useState(null);

    // Sync height states
    useEffect(() => {
        if (unit === 'cm') {
            // Convert cm to ft/in for internal consistency if needed, but we mostly use cm or total inches
            const totalInches = heightCm / 2.54;
            setHeightFt(Math.floor(totalInches / 12));
            setHeightIn(Math.round(totalInches % 12));
        } else {
            // Convert ft/in to cm
            const totalInches = (heightFt * 12) + heightIn;
            setHeightCm(Math.round(totalInches * 2.54));
        }
    }, [unit, heightCm, heightFt, heightIn]);

    useEffect(() => {
        calculateAllFormulas();
    }, [gender, heightCm]); // Trigger on cm height change (which is synced from ft/in)

    const calculateAllFormulas = () => {
        // Common variables
        const totalInches = heightCm / 2.54;
        const inchesOver60 = totalInches - 60;

        // Helper specifically for handling < 5ft (60 inches)
        // If < 60, inchesOver60 is negative, subtracting weight.

        // 1. Robinson (1983)
        // Men: 52 kg + 1.9 kg per inch over 5 feet
        // Women: 49 kg + 1.7 kg per inch over 5 feet
        const robinsonBase = gender === 'male' ? 52 : 49;
        const robinsonRate = gender === 'male' ? 1.9 : 1.7;
        const robinson = robinsonBase + (robinsonRate * inchesOver60);

        // 2. Miller (1983)
        // Men: 56.2 kg + 1.41 kg per inch over 5 feet
        // Women: 53.1 kg + 1.36 kg per inch over 5 feet
        const millerBase = gender === 'male' ? 56.2 : 53.1;
        const millerRate = gender === 'male' ? 1.41 : 1.36;
        const miller = millerBase + (millerRate * inchesOver60);

        // 3. Hamwi (1964)
        // Men: 48.0 kg + 2.7 kg per inch over 5 feet
        // Women: 45.5 kg + 2.2 kg per inch over 5 feet
        const hamwiBase = gender === 'male' ? 48.0 : 45.5;
        const hamwiRate = gender === 'male' ? 2.7 : 2.2;
        const hamwi = hamwiBase + (hamwiRate * inchesOver60);

        // 4. Devine (1974)
        // Men: 50.0 kg + 2.3 kg per inch over 5 feet
        // Women: 45.5 kg + 2.3 kg per inch over 5 feet
        const devineBase = gender === 'male' ? 50.0 : 45.5;
        const devineRate = 2.3;
        const devine = devineBase + (devineRate * inchesOver60);

        // 4. Healthy BMI Range (18.5 - 24.9)
        const hM = heightCm / 100;
        const minBMI = 18.5 * (hM * hM);
        const maxBMI = 24.9 * (hM * hM);

        setResults({
            robinson: robinson > 0 ? robinson.toFixed(1) : "N/A",
            miller: miller > 0 ? miller.toFixed(1) : "N/A",
            hamwi: hamwi > 0 ? hamwi.toFixed(1) : "N/A",
            devine: devine > 0 ? devine.toFixed(1) : "N/A",
            bmiMin: minBMI.toFixed(1),
            bmiMax: maxBMI.toFixed(1)
        });
    };

    const handleHeightChangeCm = (e) => {
        const val = Number(e.target.value);
        setHeightCm(val);
    };

    const handleHeightChangeFt = (e) => {
        setHeightFt(Number(e.target.value));
    };

    const handleHeightChangeIn = (e) => {
        setHeightIn(Number(e.target.value));
    };

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans pb-20 selection:bg-indigo-500 selection:text-white">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-slate-50 z-0"></div>
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12">

                {/* Header */}
                <div className="text-center mb-16 space-y-3">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight">
                        Ideal Weight <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Calculator</span>
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Discover your optimal weight using medically standardized formulas from Robinson, Miller, and Hamwi.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* INPUT SECTION */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white shadow-xl shadow-indigo-100/50">

                            {/* Gender Toggle */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gender</label>
                                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                                    <button
                                        onClick={() => setGender('male')}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${gender === 'male'
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <span className="text-lg">👨</span> Male
                                    </button>
                                    <button
                                        onClick={() => setGender('female')}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${gender === 'female'
                                            ? 'bg-white text-pink-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <span className="text-lg">👩</span> Female
                                    </button>
                                </div>
                            </div>

                            {/* Age Input */}
                            <div className="mb-8">
                                <div className="flex justify-between items-baseline mb-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                                    <span className="text-xl font-bold text-slate-800 tabular-nums">{age}</span>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="100"
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                                />
                                <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                                    <span>2</span>
                                    <span>100</span>
                                </div>
                            </div>

                            {/* Height Input */}
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Height</label>

                                    {/* Unit Toggle */}
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setUnit('cm')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${unit === 'cm' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            CM
                                        </button>
                                        <button
                                            onClick={() => setUnit('ft')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${unit === 'ft' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            FT
                                        </button>
                                    </div>
                                </div>

                                {unit === 'cm' ? (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={heightCm}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                // Sync ft/in immediately for smoother transition if blocked
                                                setHeightCm(val);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center tabular-nums"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">cm</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={heightFt}
                                                onChange={handleHeightChangeFt}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center tabular-nums"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">ft</span>
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={heightIn}
                                                onChange={handleHeightChangeIn}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center tabular-nums"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">in</span>
                                        </div>
                                    </div>
                                )}

                                {/* Range slider for height (always controls cm for smoothness) */}
                                <input
                                    type="range"
                                    min="100"
                                    max="230"
                                    value={heightCm}
                                    onChange={handleHeightChangeCm}
                                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all mt-6"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RESULTS SECTION */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Primary Formula Cards */}
                        {/* Primary Formula Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Robinson Card */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Robinson (1983)</div>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{results?.robinson} <span className="text-sm font-bold text-slate-400">kg</span></div>
                            </div>

                            {/* Miller Card */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-pink-500 transition-colors">Miller (1983)</div>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{results?.miller} <span className="text-sm font-bold text-slate-400">kg</span></div>
                            </div>

                            {/* Devine Card */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Devine (1974)</div>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{results?.devine} <span className="text-sm font-bold text-slate-400">kg</span></div>
                            </div>
                            {/* Hamwi Card */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Hamwi (1964)</div>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{results?.hamwi} <span className="text-sm font-bold text-slate-400">kg</span></div>
                            </div>

                        </div>

                        {/* Healthy BMI Range Card - Large Feature */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                            {/* Decorative Blur */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-bold mb-3 uppercase tracking-wider backdrop-blur-sm">
                                        <span>🩺</span> Medical Standard
                                    </div>
                                    <h2 className="text-2xl font-bold mb-1">Healthy BMI Range</h2>
                                    <p className="text-indigo-200 text-sm max-w-xs">Based on World Health Organization (WHO) guidelines for BMI 18.5 - 24.9</p>
                                </div>

                                <div className="flex items-center gap-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <div className="text-center">
                                        <span className="block text-4xl font-black tracking-tight">{results?.bmiMin}</span>
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Min kg</span>
                                    </div>
                                    <div className="h-10 w-px bg-white/20"></div>
                                    <div className="text-center">
                                        <span className="block text-4xl font-black tracking-tight">{results?.bmiMax}</span>
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Max kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info / Disclosure */}
                        <div className="bg-slate-100/50 rounded-2xl p-6 text-sm text-slate-500 leading-relaxed border border-slate-200/60">
                            <p className="mb-2"><strong className="text-slate-700">Which formula is right?</strong> There is no single "correct" weight. These formulas were derived from actuarial data to estimate ideal body weight for drug dosages and health assessments.</p>
                            <ul className="list-disc list-inside space-y-1 ml-1 opacity-80">
                                <li><strong>Robinson:</strong> Often used as a modification of Devine.</li>
                                <li><strong>Miller:</strong> derived in 1983, often results in lower estimates.</li>
                                <li><strong>Hamwi:</strong> Very popular "rule of thumb" formula (106 lbs + 6 lbs/inch).</li>
                                <li><strong>Devine:</strong> The most widely used formula, originally for drug dosing.</li>
                            </ul>
                        </div>

                        <AdUnit />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
}
