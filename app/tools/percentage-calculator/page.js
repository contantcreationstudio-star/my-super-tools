'use client';

import { useState } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function PercentageCalculator() {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-500 selection:text-white pb-20">

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-bold shadow-sm animate-fade-in-up">
                        ✨ Smart Math Tool
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Percentage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Calculator</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Solve complex percentage problems in seconds. <br className="hidden md:block" />
                        Designed for students, professionals, and everyone in between.
                    </p>
                </div>

                <div className="grid gap-8">
                    {/* Card 1: Find Percentage */}
                    <SimplePercentageCard />

                    {/* Card 2: What Percentage */}
                    <WhatPercentageCard />

                    {/* Card 3: Percentage Change */}
                    <PercentageChangeCard />
                </div>

                <HowToUse />

                <div className="mt-20">
                    <AdUnit />
                </div>
            </div>
        </div>
    );
}

// --- How To Use Section ---
function HowToUse() {
    return (
        <div className="mt-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/50 shadow-xl shadow-slate-200/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl text-indigo-600">💡</div>
                How to use
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
                <GuideStep
                    num="1"
                    title="Find Percentage"
                    desc="Calculate a portion of a total number."
                    example="20% of 500 = 100"
                />
                <GuideStep
                    num="2"
                    title="What Percentage"
                    desc="Find relative percentage of two numbers."
                    example="25 is 25% of 100"
                />
                <GuideStep
                    num="3"
                    title="Percentage Change"
                    desc="See increase or decrease between values."
                    example="100 to 150 = 50% Up"
                />
            </div>
        </div>
    );
}

function GuideStep({ num, title, desc, example }) {
    return (
        <div className="relative group">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Mode 0{num}</div>
            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h4>
            <p className="text-slate-500 text-sm mb-3 leading-relaxed">{desc}</p>
            <div className="bg-indigo-50/50 rounded-lg px-3 py-2 text-xs font-medium text-indigo-600 border border-indigo-100/50">
                Example: {example}
            </div>
        </div>
    );
}

// --- Card 1: What is X% of Y? ---
function SimplePercentageCard() {
    const [percent, setPercent] = useState('');
    const [value, setValue] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (percent && value) {
            const res = (parseFloat(percent) / 100) * parseFloat(value);
            setResult(res % 1 !== 0 ? res.toFixed(2) : res);
        }
    };

    return (
        <CalcCard
            icon="🎯"
            title="Find Percentage"
            subtitle="Calculate the percentage value of a number."
            isActive={!!result}
        >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xl font-medium text-slate-400 my-4">
                <span className="hidden md:inline">What is</span>
                <StyledInput
                    placeholder="20"
                    value={percent}
                    onChange={setPercent}
                    label="%"
                />
                <span className="text-slate-300">of</span>
                <StyledInput
                    placeholder="500"
                    value={value}
                    onChange={setValue}
                />
                <span className="hidden md:inline">?</span>
            </div>

            <CalcButton onClick={calculate} />

            {result !== null && (
                <ResultDisplay value={result} label="Answer" />
            )}
        </CalcCard>
    );
}

// --- Card 2: X is what % of Y? ---
function WhatPercentageCard() {
    const [part, setPart] = useState('');
    const [total, setTotal] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (part && total) {
            const res = (parseFloat(part) / parseFloat(total)) * 100;
            setResult(res % 1 !== 0 ? res.toFixed(2) : res);
        }
    };

    return (
        <CalcCard
            icon="🔍"
            title="What Percentage?"
            subtitle="Find out what percentage X is of Y."
            isActive={!!result}
        >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xl font-medium text-slate-400 my-4">
                <StyledInput
                    placeholder="25"
                    value={part}
                    onChange={setPart}
                />
                <span className="text-slate-300">is what % of</span>
                <StyledInput
                    placeholder="100"
                    value={total}
                    onChange={setTotal}
                />
                <span className="hidden md:inline">?</span>
            </div>

            <CalcButton onClick={calculate} />

            {result !== null && (
                <ResultDisplay value={result + '%'} label="Answer" />
            )}
        </CalcCard>
    );
}

// --- Card 3: Percentage Change ---
function PercentageChangeCard() {
    const [fromVal, setFromVal] = useState('');
    const [toVal, setToVal] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (fromVal && toVal) {
            const v1 = parseFloat(fromVal);
            const v2 = parseFloat(toVal);
            if (v1 === 0) return;
            const diff = v2 - v1;
            const res = (diff / v1) * 100;
            setResult(res % 1 !== 0 ? res.toFixed(2) : res);
        }
    };

    const isIncrease = result !== null && result > 0;
    const isDecrease = result !== null && result < 0;

    return (
        <CalcCard
            icon="📈"
            title="Percentage Change"
            subtitle="Calculate increase or decrease between two values."
            isActive={!!result}
        >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xl font-medium text-slate-400 my-4">
                <span className="hidden md:inline">From</span>
                <StyledInput
                    placeholder="100"
                    value={fromVal}
                    onChange={setFromVal}
                    label="Start"
                />
                <span className="text-slate-300">to</span>
                <StyledInput
                    placeholder="150"
                    value={toVal}
                    onChange={setToVal}
                    label="End"
                />
            </div>

            <CalcButton onClick={calculate} />

            {result !== null && (
                <div className={`mt-8 p-6 rounded-2xl animate-scale-in text-center ${isIncrease ? 'bg-green-50 text-green-700' : isDecrease ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
                    }`}>
                    <div className="text-sm font-bold uppercase tracking-wider mb-1 opacity-70">
                        {isIncrease ? 'Increase' : isDecrease ? 'Decrease' : 'Change'}
                    </div>
                    <div className="text-4xl font-black flex items-center justify-center gap-2">
                        {isIncrease && <span>↗</span>}
                        {isDecrease && <span>↘</span>}
                        {Math.abs(result)}%
                    </div>
                </div>
            )}
        </CalcCard>
    );
}

// --- Shared Components for Premium Look ---

function CalcCard({ icon, title, subtitle, children, isActive }) {
    return (
        <div className={`
            relative bg-white rounded-[2rem] p-8 md:p-10 border transition-all duration-500 overflow-hidden group
            ${isActive
                ? 'shadow-2xl shadow-indigo-500/10 border-indigo-100 ring-2 ring-indigo-500/5'
                : 'shadow-xl shadow-slate-200/40 border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5'
            }
        `}>
            {/* Background Gradient Blob on Hover */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center text-3xl mb-6 border border-slate-50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
                <p className="text-slate-500 mb-8 max-w-sm">{subtitle}</p>

                <div className="w-full max-w-2xl bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100/50">
                    {children}
                </div>
            </div>
        </div>
    );
}

function StyledInput({ value, onChange, placeholder, label }) {
    return (
        <div className="relative group">
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-28 md:w-32 py-4 px-4 rounded-xl border-2 border-slate-200 bg-white text-center font-bold text-slate-800 text-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 shadow-sm"
            />
            {label && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                    {label}
                </div>
            )}
        </div>
    );
}

function CalcButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="mt-8 group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full md:w-auto min-w-[200px]"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
                Calculate Result
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
        </button>
    );
}

function ResultDisplay({ value, label }) {
    return (
        <div className="mt-8 animate-fade-in-up">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</div>
            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 drop-shadow-sm">
                {value}
            </div>
        </div>
    );
}
