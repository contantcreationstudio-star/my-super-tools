'use client';

import { useState, useMemo } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function WordCounter() {
    const [text, setText] = useState('');
    const [alertMsg, setAlertMsg] = useState('');

    // --- Statistics Logic ---
    const stats = useMemo(() => {
        const trimmed = text.trim();
        if (!trimmed) {
            return { words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, readTime: 0 };
        }

        const words = text.split(/\s+/).filter(w => w !== '').length;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '').length;
        const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '').length;
        const readTime = Math.ceil(words / 200); // Avg reading speed 200 wpm

        return { words, chars, charsNoSpace, sentences, paragraphs, readTime };
    }, [text]);

    // --- Toolbar Actions ---
    const copyToClipboard = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        showAlert('Copied to clipboard!');
    };

    const clearText = () => {
        if (confirm("Are you sure you want to clear the text?")) {
            setText('');
            showAlert('Text cleared');
        }
    };

    const removeExtraSpaces = () => {
        const newText = text.replace(/\s+/g, ' ').trim();
        setText(newText);
        showAlert('Extra spaces removed');
    };

    const toUpperCase = () => setText(text.toUpperCase());
    const toLowerCase = () => setText(text.toLowerCase());

    const showAlert = (msg) => {
        setAlertMsg(msg);
        setTimeout(() => setAlertMsg(''), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white relative">

            {/* Alert Toast */}
            {alertMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-fade-in-down font-medium text-sm">
                    {alertMsg}
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Word Counter</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Analyze your text instantly. Count words, characters, and estimate reading time.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Main Input Area */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Toolbar */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2 items-center">
                            <ActionButton onClick={copyToClipboard} icon="📋" label="Copy" primary />
                            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
                            <ActionButton onClick={removeExtraSpaces} icon="🧹" label="Fix Spaces" />
                            <ActionButton onClick={toUpperCase} icon="🔠" label="UPPER" />
                            <ActionButton onClick={toLowerCase} icon="🔡" label="lower" />
                            <div className="flex-1"></div>
                            <ActionButton onClick={clearText} icon="🗑️" label="Clear" danger />
                        </div>

                        {/* Text Area */}
                        <div className="relative group">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type or paste your text here..."
                                className="w-full h-[500px] p-6 lg:p-8 rounded-3xl border-2 border-slate-200 bg-white text-slate-700 text-lg leading-relaxed focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none shadow-xl shadow-slate-200/50"
                                spellCheck="false"
                            ></textarea>
                            {/* Char count indicator inside */}
                            <div className="absolute bottom-6 right-6 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full pointer-events-none">
                                {stats.chars} chars
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/20">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-blue-400">📊</span> Live Statistics
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Words" value={stats.words} highlight />
                                <StatCard label="Sentences" value={stats.sentences} />
                                <StatCard label="Paragraphs" value={stats.paragraphs} />
                                <StatCard label="Read Time" value={`~${stats.readTime} m`} />
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-400">Characters (with spaces)</span>
                                    <span className="text-white">{stats.chars.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-400">Characters (no spaces)</span>
                                    <span className="text-white">{stats.charsNoSpace.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Text Insights</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                The average reading speed is <strong>200 words per minute</strong>.
                                Your text will take approximately <strong>{stats.readTime} minute{stats.readTime !== 1 && 's'}</strong> to read.
                            </p>
                        </div>

                        <AdUnit />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function ActionButton({ onClick, icon, label, primary, danger }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                ${primary
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                    : danger
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
            `}
        >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function StatCard({ label, value, highlight }) {
    return (
        <div className={`p-4 rounded-2xl ${highlight ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700'}`}>
            <div className={`text-3xl font-black mb-1 ${highlight ? 'text-white' : 'text-slate-200'}`}>
                {value}
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>
                {label}
            </div>
        </div>
    );
}
