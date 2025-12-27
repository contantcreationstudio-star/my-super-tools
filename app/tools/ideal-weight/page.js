'use client';

import { useState, useEffect } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function IdealWeightCalculator() {
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170); // cm
    const [result, setResult] = useState(null);

    // Dynamic Height Display (Ft + In)
    const heightInInches = height / 2.54;
    const feet = Math.floor(heightInInches / 12);
    const inches = Math.round(heightInInches % 12);

    useEffect(() => {
        calculateWeight();
    }, [gender, age, height]);

    const calculateWeight = () => {
        // 1. Devine Formula
        // Male: 50kg + 2.3kg * (Height(in) - 60)
        // Female: 45.5kg + 2.3kg * (Height(in) - 60)

        let ideal = 0;
        const base = gender === 'male' ? 50 : 45.5;

        if (heightInInches > 60) {
            ideal = base + 2.3 * (heightInInches - 60);
        } else {
            // Fallback/Clamp for short heights (standard formula breaks below 5ft)
            // Linear interpolation or simple base reduction could work, 
            // but standard practice usually clamps or uses BMI mean for short statures.
            // For simplicity and correctness with the formula's intent:
            ideal = base;
            // (Or we can subtract, but that gets risky for very short people. Let's clamp at base for <5ft for safety/UX)
            // Actually, let's allow slight subtraction but clamp min 20kg
            const diff = 60 - heightInInches;
            ideal = base - (2.3 * diff);
        }

        // 2. Healthy BMI Range (18.5 - 24.9)
        const heightM = height / 100;
        const minHealthy = 18.5 * (heightM * heightM);
        const maxHealthy = 24.9 * (heightM * heightM);

        setResult({
            ideal: ideal > 0 ? ideal.toFixed(1) : "N/A",
            min: minHealthy.toFixed(1),
            max: maxHealthy.toFixed(1)
        });
    };

    return (
        <div className="min-h-screen bg-teal-50 relative font-sans pb-20">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(45deg, #0d9488 25%, transparent 25%, transparent 75%, #0d9488 75%, #0d9488), linear-gradient(45deg, #0d9488 25%, transparent 25%, transparent 75%, #0d9488 75%, #0d9488)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px'
            }}></div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold mb-4 uppercase tracking-wider">
                        <span>⚖️</span> Health Matters
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
                        Ideal <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Weight</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-lg mx-auto">
                        Find your scientifically recommended weight based on the Devine Formula.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* LEFT: INPUTS */}
                    <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white shadow-xl shadow-teal-100/50">
                        {/* Gender */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-teal-700 uppercase tracking-wider mb-3">Gender</label>
                            <div className="flex gap-2 p-1 bg-teal-50 rounded-xl border border-teal-100">
                                {['male', 'female'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g)}
                                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${gender === g
                                                ? 'bg-white text-teal-600 shadow-md ring-1 ring-teal-100'
                                                : 'text-slate-400 hover:text-teal-500'
                                            }`}
                                    >
                                        {g === 'male' ? '👨 Male' : '👩 Female'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Age */}
                        <div className="mb-8">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-teal-700 uppercase tracking-wider">Age</label>
                                <span className="text-2xl font-black text-slate-800">{age}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="w-full h-3 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                        </div>

                        {/* Height */}
                        <div className="mb-4">
                            <div className="flex justify-between mb-2 align-bottom">
                                <label className="text-sm font-bold text-teal-700 uppercase tracking-wider">Height</label>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-slate-800 block leading-none">{height} <span className="text-sm text-slate-400 font-medium">cm</span></span>
                                    <span className="text-xs text-teal-600 font-bold">{feet}' {inches}"</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="220"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className="w-full h-3 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                        </div>
                    </div>

                    {/* RIGHT: RESULTS */}
                    <div className="space-y-6">
                        {/* Main Ideal Weight Card */}
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden text-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 translate-x-10 -translate-y-10"></div>

                            <h3 className="text-teal-100 font-bold uppercase tracking-widest text-sm mb-2">Ideal Weight</h3>
                            <div className="text-6xl md:text-7xl font-black tracking-tighter mb-2">
                                {result?.ideal} <span className="text-3xl text-teal-200">kg</span>
                            </div>
                            <p className="text-teal-100 text-sm opacity-90">Based on Devine Formula (1974)</p>
                        </div>

                        {/* Healthy Range Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-teal-100 shadow-lg flex flex-col items-center">
                            <h4 className="text-slate-500 font-bold uppercase text-xs tracking-wider mb-4">Healthy BMI Range</h4>
                            <div className="flex items-center gap-4 text-slate-800">
                                <div className="text-center">
                                    <span className="block text-2xl font-black">{result?.min}</span>
                                    <span className="text-xs text-slate-400">Min (kg)</span>
                                </div>
                                <div className="h-8 w-px bg-slate-200"></div>
                                <div className="text-center">
                                    <span className="block text-2xl font-black">{result?.max}</span>
                                    <span className="text-xs text-slate-400">Max (kg)</span>
                                </div>
                            </div>
                        </div>

                        <AdUnit />
                    </div>
                </div>

                {/* SEO Content */}
                <article className="mt-16 prose prose-teal max-w-none text-slate-500 text-center text-sm">
                    <h3>About the Formula</h3>
                    <p>
                        We use the <strong>Devine Formula</strong>, which is the most widely used equation for calculating Ideal Body Weight (IBW).
                        It was originally developed in 1974 to determine drug dosages but is now a standard reference for health assessments.
                    </p>
                    <p>
                        <em>Note: This tool provides general estimates. Always consult a healthcare professional for personalized advice.</em>
                    </p>
                </article>

            </div>
        </div>
    );
}
