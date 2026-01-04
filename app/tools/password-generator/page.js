'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Shield, Check, History, Lock, Settings, Shuffle, Layers, ArrowUp, ArrowDown, BookOpen, Type, Brain, Hash } from 'lucide-react';
import AdUnit from '@/components/AdUnit';
import { WORD_LIST } from './words';

export default function PasswordGenerator() {
    // Mode: 'simple', 'advanced', 'memorable', 'pin'
    const [mode, setMode] = useState('simple');

    // Simple Mode State
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });

    // Advanced Mode State
    const [counts, setCounts] = useState({
        uppercase: 4,
        lowercase: 8,
        numbers: 2,
        symbols: 2
    });
    const [sequence, setSequence] = useState(['uppercase', 'lowercase', 'numbers', 'symbols']);
    const [maintainOrder, setMaintainOrder] = useState(false);

    // Memorable Mode State
    const [memorableCount, setMemorableCount] = useState(4);
    const [separator, setSeparator] = useState('-');
    const [capitalize, setCapitalize] = useState(true);

    // PIN Mode State
    const [pinLength, setPinLength] = useState(4);

    // Shared State
    const [password, setPassword] = useState('');
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState(0);

    // Character Sets
    const CHAR_SETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    const LABELS = {
        uppercase: 'ABC (Uppercase)',
        lowercase: 'abc (Lowercase)',
        numbers: '123 (Numbers)',
        symbols: '@#$ (Symbols)'
    };

    // Calculate strength score (0-4)
    const calculateStrength = useCallback((pwd, currentMode) => {
        if (!pwd) return 0;

        if (currentMode === 'pin') {
            if (pwd.length <= 4) return 1; // Weak
            if (pwd.length <= 6) return 2; // Medium
            if (pwd.length <= 8) return 3; // Strong
            return 4; // Very Strong (for a PIN)
        }

        if (currentMode === 'memorable') {
            if (memorableCount <= 3) return 2;
            if (memorableCount === 4) return 3;
            if (memorableCount >= 5) return 4;
            return 3;
        }

        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (pwd.length >= 20) score = 4;
        return Math.min(score, 4);
    }, [memorableCount]);

    // Secure Random Picker
    const getRandomChar = (charset) => {
        const randomValues = new Uint32Array(1);
        window.crypto.getRandomValues(randomValues);
        return charset[randomValues[0] % charset.length];
    };

    const getRandomWord = () => {
        const randomValues = new Uint32Array(1);
        window.crypto.getRandomValues(randomValues);
        return WORD_LIST[randomValues[0] % WORD_LIST.length];
    };

    // Shuffle String
    const shuffleString = (str) => {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const randomValues = new Uint32Array(1);
            window.crypto.getRandomValues(randomValues);
            const j = randomValues[0] % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    };

    // Main Generation Logic
    const generatePassword = useCallback((saveHistory = true) => {
        let newPassword = '';

        if (mode === 'pin') {
            // --- PIN MODE ---
            const charset = CHAR_SETS.numbers;
            for (let i = 0; i < pinLength; i++) {
                newPassword += getRandomChar(charset);
            }

        } else if (mode === 'memorable') {
            // --- MEMORABLE MODE ---
            const words = [];
            for (let i = 0; i < memorableCount; i++) {
                let word = getRandomWord();
                if (capitalize) {
                    word = word.charAt(0).toUpperCase() + word.slice(1);
                }
                words.push(word);
            }
            newPassword = words.join(separator === 'none' ? '' : separator === 'space' ? ' ' : separator);

        } else if (mode === 'simple') {
            // --- SIMPLE MODE ---
            let charset = '';
            if (options.uppercase) charset += CHAR_SETS.uppercase;
            if (options.lowercase) charset += CHAR_SETS.lowercase;
            if (options.numbers) charset += CHAR_SETS.numbers;
            if (options.symbols) charset += CHAR_SETS.symbols;

            if (charset === '') return;

            // Basic generation (ensure random distribution)
            for (let i = 0; i < length; i++) {
                newPassword += getRandomChar(charset);
            }

        } else {
            // --- ADVANCED MODE (Structured) ---
            const parts = [];

            // Generate parts based on sequence
            sequence.forEach(type => {
                const count = counts[type];
                const charset = CHAR_SETS[type];
                for (let i = 0; i < count; i++) parts.push(getRandomChar(charset));
            });

            newPassword = parts.join('');

            if (!maintainOrder) {
                newPassword = shuffleString(newPassword);
            }
        }

        setPassword(newPassword);
        setStrength(calculateStrength(newPassword, mode));

        if (saveHistory) {
            setHistory(prev => {
                const newHistory = [newPassword, ...prev].slice(0, 3);
                return newHistory;
            });
        }
        setCopied(false);

    }, [mode, length, options, counts, sequence, maintainOrder, memorableCount, separator, capitalize, pinLength, calculateStrength]);

    // Real-time Triggers
    useEffect(() => {
        generatePassword(false);
    }, [mode, length, options, counts, sequence, maintainOrder, memorableCount, separator, capitalize, pinLength, generatePassword]);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOptionChange = (key) => {
        const activeCount = Object.values(options).filter(Boolean).length;
        if (activeCount === 1 && options[key]) return;
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCountChange = (key, val) => {
        setCounts(prev => ({ ...prev, [key]: Math.max(0, Number(val)) }));
    };

    const moveItem = (index, direction) => {
        const newSequence = [...sequence];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newSequence.length) return;

        [newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]];
        setSequence(newSequence);
    };

    // Calculate Total Length for Advanced Mode
    const totalLength = counts.uppercase + counts.lowercase + counts.numbers + counts.symbols;

    const getStrengthColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength === 2) return 'bg-yellow-500';
        if (strength === 3) return 'bg-green-500';
        return 'bg-emerald-500 shadow-[0_0_15px_#10b981]';
    };

    const getStrengthLabel = () => {
        if (strength <= 1) return 'Weak';
        if (strength === 2) return 'Medium';
        if (strength === 3) return 'Strong';
        return 'Unbreakable';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

            {/* Header */}
            <header className="py-6 px-4 bg-slate-900 border-b border-slate-800/50">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <Lock size={24} />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Strong Password Generator
                        </h1>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex bg-slate-800 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
                        <button
                            onClick={() => setMode('simple')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${mode === 'simple' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Simple
                        </button>
                        <button
                            onClick={() => setMode('advanced')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${mode === 'advanced' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Advanced
                        </button>
                        <button
                            onClick={() => setMode('memorable')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${mode === 'memorable' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Memorable
                        </button>
                        <button
                            onClick={() => setMode('pin')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${mode === 'pin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            PIN
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">

                {/* 1. Display Area */}
                <div className="relative group">
                    <div className={`absolute -inset-1 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500 ${mode === 'memorable' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : mode === 'pin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 flex flex-col items-center text-center shadow-2xl">

                        <div className="w-full break-all font-mono text-3xl md:text-5xl font-bold text-white mb-8 tracking-wider min-h-[3.5rem] flex items-center justify-center">
                            {password}
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={handleCopy}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : mode === 'pin' ? 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 shadow-lg shadow-purple-900/50' : mode === 'memorable' ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-lg shadow-blue-900/50' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 shadow-lg shadow-emerald-900/50'}`}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={() => generatePassword(true)}
                                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all hover:scale-105 border border-slate-700"
                                title="Regenerate"
                            >
                                <RefreshCw size={24} className="hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        {/* Strength Indicator */}
                        <div className="w-full mt-10">
                            <div className="flex justify-between text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">
                                <span>Security Check</span>
                                <span className={strength >= 4 ? 'text-emerald-400' : 'text-slate-400'}>{getStrengthLabel()}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                <div className={`h-full flex-1 rounded-full transition-all duration-500 ${strength > 0 ? getStrengthColor() : 'opacity-0'}`}></div>
                                <div className={`h-full flex-1 rounded-full transition-all duration-500 ${strength > 1 ? getStrengthColor() : 'bg-slate-800'}`}></div>
                                <div className={`h-full flex-1 rounded-full transition-all duration-500 ${strength > 2 ? getStrengthColor() : 'bg-slate-800'}`}></div>
                                <div className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= 4 ? getStrengthColor() : 'bg-slate-800'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {mode === 'simple' && (
                        <>
                            {/* SIMPLE MODE UI */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                    <Settings size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Length</h2>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl font-black text-white">{length}</span>
                                    <span className="text-slate-500 text-sm font-medium">characters</span>
                                </div>
                                <input type="range" min="8" max="50" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400" />
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                    <Shield size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Character Sets</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Existing Checkboxes */}
                                    <label className={`flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition border ${options.uppercase ? 'border-emerald-500/30' : 'border-transparent'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${options.uppercase ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'}`}>{options.uppercase && <Check size={14} strokeWidth={4} />}</div>
                                        <input type="checkbox" checked={options.uppercase} onChange={() => handleOptionChange('uppercase')} className="hidden" />
                                        <span className="font-medium text-slate-300">ABC</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition border ${options.lowercase ? 'border-emerald-500/30' : 'border-transparent'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${options.lowercase ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'}`}>{options.lowercase && <Check size={14} strokeWidth={4} />}</div>
                                        <input type="checkbox" checked={options.lowercase} onChange={() => handleOptionChange('lowercase')} className="hidden" />
                                        <span className="font-medium text-slate-300">abc</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition border ${options.numbers ? 'border-emerald-500/30' : 'border-transparent'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${options.numbers ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'}`}>{options.numbers && <Check size={14} strokeWidth={4} />}</div>
                                        <input type="checkbox" checked={options.numbers} onChange={() => handleOptionChange('numbers')} className="hidden" />
                                        <span className="font-medium text-slate-300">123</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition border ${options.symbols ? 'border-emerald-500/30' : 'border-transparent'}`}>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${options.symbols ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'}`}>{options.symbols && <Check size={14} strokeWidth={4} />}</div>
                                        <input type="checkbox" checked={options.symbols} onChange={() => handleOptionChange('symbols')} className="hidden" />
                                        <span className="font-medium text-slate-300">@#$</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'advanced' && (
                        <>
                            {/* ADVANCED MODE UI */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1">
                                <div className="flex items-center justify-between mb-4 text-emerald-400">
                                    <div className="flex items-center gap-2">
                                        <Settings size={20} />
                                        <h2 className="font-bold uppercase tracking-wider text-sm">Structure & Counts</h2>
                                    </div>
                                    {maintainOrder && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Ordered</span>}
                                </div>
                                <div className="flex flex-col gap-3">
                                    {sequence.map((type, index) => (
                                        <div key={type} className="flex items-center gap-3 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50 hover:border-slate-600 transition group">
                                            {/* Reorder Buttons */}
                                            <div className="flex flex-col gap-1 text-slate-500">
                                                <button
                                                    onClick={() => moveItem(index, -1)}
                                                    disabled={index === 0}
                                                    className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 1)}
                                                    disabled={index === sequence.length - 1}
                                                    className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>

                                            <span className="flex-1 text-slate-300 font-medium text-sm">{LABELS[type]}</span>

                                            <input
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={counts[type]}
                                                onChange={(e) => handleCountChange(type, e.target.value)}
                                                className="w-16 bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-center focus:border-emerald-500 focus:outline-none font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                        <Layers size={20} />
                                        <h2 className="font-bold uppercase tracking-wider text-sm">Structure</h2>
                                    </div>
                                    <div className="mb-6">
                                        <div className="text-sm text-slate-400 mb-2">Total Length</div>
                                        <div className="text-4xl font-black text-white">{totalLength}</div>
                                    </div>
                                    <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-transparent hover:border-emerald-500/30 select-none">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${maintainOrder ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'}`}>
                                            {maintainOrder && <Check size={14} strokeWidth={4} />}
                                        </div>
                                        <input type="checkbox" checked={maintainOrder} onChange={() => setMaintainOrder(!maintainOrder)} className="hidden" />
                                        <div>
                                            <span className="font-medium text-slate-200 block">Maintain Sequence</span>
                                            <span className="text-xs text-slate-500 block">Output follows list order above</span>
                                        </div>
                                    </label>

                                    <div className={`mt-4 p-3 rounded-lg text-xs border ${!maintainOrder ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                        {!maintainOrder ? (
                                            <div className="flex items-center gap-2">
                                                <Shuffle size={14} />
                                                <span>Characters from all sets mixed randomly.</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Layers size={14} />
                                                <span>Groups appended in order (e.g. 111AAAaaa@@).</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'memorable' && (
                        <>
                            {/* MEMORABLE MODE UI */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1">
                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                    <Brain size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Word Settings</h2>
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-300 font-medium">Word Count</span>
                                        <span className="text-2xl font-bold text-white">{memorableCount}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="10"
                                        value={memorableCount}
                                        onChange={(e) => setMemorableCount(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                                    />
                                    <div className="flex justify-between text-xs text-slate-600 mt-2 font-mono">
                                        <span>3</span>
                                        <span>10</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-slate-400 text-sm">Separator</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['-', '_', '.', 'space', 'none'].map((sep) => (
                                            <button
                                                key={sep}
                                                onClick={() => setSeparator(sep)}
                                                className={`p-2 rounded-lg font-mono text-sm border transition ${separator === sep ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                            >
                                                {sep === 'space' ? '␣' : sep === 'none' ? 'Ø' : sep}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1">
                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                    <Type size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Formatting</h2>
                                </div>

                                <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-transparent hover:border-blue-500/30 select-none mb-4">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${capitalize ? 'bg-blue-500 border-blue-500 text-slate-950' : 'border-slate-600'}`}>
                                        {capitalize && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <input type="checkbox" checked={capitalize} onChange={() => setCapitalize(!capitalize)} className="hidden" />
                                    <div>
                                        <span className="font-medium text-slate-200 block">Capitalize</span>
                                        <span className="text-xs text-slate-500 block">Correct-Horse-Battery</span>
                                    </div>
                                </label>

                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <BookOpen size={16} />
                                        <span className="font-bold text-xs uppercase tracking-wider">Why Memorable?</span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        "Diceware" style passwords are easy for humans to remember but mathematically hard for computers to guess due to the high entropy of random words.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'pin' && (
                        <>
                            {/* PIN MODE UI */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2">
                                <div className="flex items-center gap-2 mb-4 text-purple-400">
                                    <Hash size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">PIN Settings</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-slate-300 font-medium">Length</span>
                                            <span className="text-2xl font-bold text-white">{pinLength}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="3"
                                            max="12"
                                            value={pinLength}
                                            onChange={(e) => setPinLength(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
                                        />
                                        <div className="flex justify-between text-xs text-slate-600 mt-2 font-mono">
                                            <span>3</span>
                                            <span>12</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <span className="text-slate-400 text-sm">Quick Presets</span>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setPinLength(4)}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all border ${pinLength === 4 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500/50'}`}
                                            >
                                                4-Digit
                                            </button>
                                            <button
                                                onClick={() => setPinLength(6)}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all border ${pinLength === 6 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500/50'}`}
                                            >
                                                6-Digit
                                            </button>
                                            <button
                                                onClick={() => setPinLength(8)}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all border ${pinLength === 8 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500/50'}`}
                                            >
                                                8-Digit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. History */}
                {history.length > 0 && (
                    <div className="opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-3 text-slate-500 px-1">
                            <History size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Recently Generated (Click to Copy)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {history.slice(1).map((histPwd, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        navigator.clipboard.writeText(histPwd);
                                    }}
                                    className="text-left font-mono bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 p-3 rounded-lg transition-all truncate text-sm"
                                >
                                    {histPwd}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <div className="mt-8">
                <AdUnit />
            </div>
        </div>
    );
}
