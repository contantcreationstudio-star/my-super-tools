'use client';

import { useState, useEffect, useRef } from 'react';
import AdUnit from '../../../components/AdUnit';

const MODES = {
    relax: { name: 'Relax (4-2-4)', in: 4000, hold: 2000, out: 4000 },
    sleep: { name: 'Sleep (4-7-8)', in: 4000, hold: 7000, out: 8000 }
};

export default function BreathingExercise() {
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('relax');
    const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale, hold_empty (optional, we stick to 3 for now)
    const [text, setText] = useState('Ready?');

    // Animation Refs
    const timeoutRef = useRef(null);

    // Stop logic
    const stopSession = () => {
        clearTimeout(timeoutRef.current);
        setIsActive(false);
        setPhase('idle');
        setText('Ready?');
    };

    // Cycle Logic
    const runCycle = () => {
        const currentMode = MODES[mode];

        // 1. Inhale
        setPhase('inhale');
        setText('Breathe In...');

        timeoutRef.current = setTimeout(() => {
            if (!isActive) return;

            // 2. Hold
            setPhase('hold');
            setText('Hold...');

            timeoutRef.current = setTimeout(() => {
                if (!isActive) return;

                // 3. Exhale
                setPhase('exhale');
                setText('Breathe Out...');

                timeoutRef.current = setTimeout(() => {
                    if (!isActive) return;
                    // Loop
                    runCycle();
                }, currentMode.out);

            }, currentMode.hold);

        }, currentMode.in);
    };

    // Effect to start/stop
    useEffect(() => {
        if (isActive) {
            runCycle();
        } else {
            stopSession();
        }
        return () => clearTimeout(timeoutRef.current);
    }, [isActive, mode]);

    // Dynamic Styles based on phase
    const getCircleStyle = () => {
        const base = "w-64 h-64 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl transition-all ease-in-out z-10 relative";

        if (phase === 'idle') return `${base} bg-slate-300 scale-100`;

        // Duration needs to match the phase length for smooth CSS transition
        const duration = phase === 'inhale' ? MODES[mode].in
            : phase === 'exhale' ? MODES[mode].out
                : 0; // Immediate for hold? Or keep previous transition?

        // Actually, for hold, we want to maintain the 'inhale' state (expanded) or 'exhale' state (contracted).
        // Inhale -> Expand to 1.5
        // Hold -> Stay at 1.5
        // Exhale -> Shrink to 1.0

        let transform = 'scale-100';
        let color = 'bg-teal-500';

        if (phase === 'inhale') {
            transform = 'scale-150';
            color = 'bg-cyan-500';
        } else if (phase === 'hold') {
            transform = 'scale-150'; // Stay expanded
            color = 'bg-teal-600';     // Slightly darker to indicate static
        } else if (phase === 'exhale') {
            transform = 'scale-100';
            color = 'bg-emerald-500';
        }

        return `${base} ${color} ${transform}`;
    };

    // We need inline styles for dynamic duration
    const transitionStyle = {
        transitionDuration: `${phase === 'hold' ? 0 : phase === 'inhale' ? MODES[mode].in : MODES[mode].out}ms`
    };

    return (
        <div className="min-h-screen bg-teal-50 font-sans selection:bg-teal-200 pb-20 flex flex-col">

            <div className="flex-grow flex flex-col items-center justify-center pt-10 px-4">

                {/* Header */}
                <div className="text-center mb-16 relative z-20">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">
                        Breathing <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Exercise</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Follow the rhythm to reduce stress.</p>
                </div>

                {/* Circle Container */}
                <div className="relative mb-20">
                    {/* Ring Pulse Effect */}
                    <div className={`absolute inset-0 rounded-full border-4 border-teal-200 animate-ping opacity-20 ${isActive ? 'block' : 'hidden'}`}></div>

                    {/* Main Circle */}
                    <div
                        className={getCircleStyle()}
                        style={transitionStyle}
                    >
                        <span className="drop-shadow-md tracking-wider text-center px-4 animate-in fade-in duration-500">
                            {text}
                        </span>
                    </div>

                    {/* Progress Ring (Optional visual flare) */}
                    {isActive && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-teal-100/50 -z-10"></div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6 w-full max-w-sm z-20">

                    {/* Mode Selector */}
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-teal-100 flex w-full">
                        {Object.keys(MODES).map(m => (
                            <button
                                key={m}
                                onClick={() => { setIsActive(false); setMode(m); }}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === m
                                        ? 'bg-teal-500 text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {MODES[m].name}
                            </button>
                        ))}
                    </div>

                    {/* Start/Stop */}
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all hover:scale-105 active:scale-95 ${isActive
                                ? 'bg-white text-rose-500 hover:bg-rose-50'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                    >
                        {isActive ? '⏸' : '▶'}
                    </button>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
                        {isActive ? 'Session Active' : 'Press Play to Begin'}
                    </p>

                </div>

            </div>

            <div className="bg-teal-50">
                <AdUnit />
            </div>

        </div>
    );
}
