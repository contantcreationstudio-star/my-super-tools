'use client';

import { useState, useRef, useEffect } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function ReactionTest() {
    // States: 'idle', 'waiting', 'ready', 'finished', 'early'
    const [gameState, setGameState] = useState('idle');
    const [startTime, setStartTime] = useState(0);
    const [reactionTime, setReactionTime] = useState(0);
    const timeoutRef = useRef(null);

    const startGame = () => {
        setGameState('waiting');
        const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2000-5000ms

        timeoutRef.current = setTimeout(() => {
            setGameState('ready');
            setStartTime(Date.now());
        }, randomDelay);
    };

    const handleClick = () => {
        if (gameState === 'idle' || gameState === 'finished' || gameState === 'early') {
            startGame();
        } else if (gameState === 'waiting') {
            // Too early!
            clearTimeout(timeoutRef.current);
            setGameState('early');
        } else if (gameState === 'ready') {
            // Success!
            const endTime = Date.now();
            setReactionTime(endTime - startTime);
            setGameState('finished');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    // Rankings
    const getRank = (ms) => {
        if (ms < 200) return { text: "⚡ God Level!", color: "text-yellow-300" };
        if (ms < 250) return { text: "👾 Cyberpunk", color: "text-cyan-300" };
        if (ms < 300) return { text: "🏎️ Pro Gamer", color: "text-green-300" };
        if (ms < 400) return { text: "🐢 Average", color: "text-slate-200" };
        return { text: "🐌 Too Slow!", color: "text-rose-300" };
    };

    const rank = getRank(reactionTime);

    // UI Config based on state
    const uiConfig = {
        idle: {
            bg: 'bg-slate-800',
            icon: '⚡',
            title: 'Reaction Time Test',
            sub: 'Click anywhere to start'
        },
        waiting: {
            bg: 'bg-rose-500',
            icon: '✋',
            title: 'Wait for Green...',
            sub: 'Do not click yet!'
        },
        ready: {
            bg: 'bg-emerald-500',
            icon: '🚀',
            title: 'CLICK!',
            sub: 'Go! Go! Go!'
        },
        finished: {
            bg: 'bg-slate-800',
            icon: '⏱️',
            title: `${reactionTime} ms`,
            sub: 'Click to try again'
        },
        early: {
            bg: 'bg-slate-800',
            icon: '⚠️',
            title: 'Too Early!',
            sub: 'Click to try again'
        }
    };

    const currentUI = uiConfig[gameState];

    return (
        <div className="min-h-screen bg-slate-900 pb-20 select-none">

            {/* Game Area */}
            <div
                onMouseDown={handleClick}
                onTouchStart={handleClick}
                className={`w-full min-h-[70vh] flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${currentUI.bg} active:opacity-95`}
            >
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    <div className="text-6xl md:text-8xl mb-6 filter drop-shadow-lg">
                        {currentUI.icon}
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                        {currentUI.title}
                    </h1>

                    <p className="text-xl md:text-2xl font-bold text-white/60 mb-8 uppercase tracking-widest">
                        {currentUI.sub}
                    </p>

                    {gameState === 'finished' && (
                        <div className={`text-3xl font-black ${rank.color} animate-bounce bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-sm border border-white/10`}>
                            {rank.text}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-8 text-white/20 text-sm font-bold uppercase tracking-wider">
                    {gameState === 'idle' ? 'Tap Screen to Start' : 'Tap Screen to Act'}
                </div>
            </div>

            {/* Info / Ad */}
            <div className="bg-slate-900 pt-12 px-4">
                <div className="max-w-2xl mx-auto text-center text-slate-500 mb-12">
                    <p className="text-sm">
                        Average human reaction time is around 250ms. <br />
                        Pilots and F1 drivers can reach 150ms!
                    </p>
                </div>
                <AdUnit />
            </div>

        </div>
    );
}
