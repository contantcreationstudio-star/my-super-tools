'use client';

import { useState, useEffect } from 'react';
import AdUnit from '../../../components/AdUnit';
import AdvancedDatePicker from '../../../components/AdvancedDatePicker';

export default function AgeCalculatorPage() {
    const [birthDate, setBirthDate] = useState('');
    const [stats, setStats] = useState(null);
    const [time, setTime] = useState(new Date());

    // --- 1. LIVE CLOCK ---
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- 2. CALCULATION ENGINE ---
    const calculateStats = () => {
        if (!birthDate) {
            // Mobile par agar date nahi dali, to alert do ya focus karo (Focus hard hai custom component pe abhi)
            alert("Please enter a valid complete date!");
            return;
        }

        const start = new Date(birthDate);
        const now = new Date();

        // Logic (Same as before)
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();

        if (days < 0) {
            months--;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const diffTime = Math.abs(now - start);
        const totalWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        const heartbeats = (diffTime / 1000 * 1.2).toFixed(0);

        const nextBday = new Date(now.getFullYear(), start.getMonth(), start.getDate());
        if (now > nextBday) nextBday.setFullYear(now.getFullYear() + 1);
        const daysToBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));

        setStats({
            years, months, days, hours, minutes, seconds,
            totalWeeks, heartbeats, daysToBday
        });


    };

    // Live Update
    useEffect(() => {
        if (stats) calculateStats();
    }, [time]);

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans pb-24 md:pb-20">

            {/* Background Mesh */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-4">

                {/* --- HEADER (Compact on Mobile) --- */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] md:text-xs font-bold mb-4 uppercase tracking-wider">
                        <span>✨</span> Precision Engine
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4">
                        Age <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dash</span>
                    </h1>
                    <p className="text-sm md:text-lg text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        Track your life's progress in real-time with atomic precision.
                    </p>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: INPUT CARD */}
                    <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white shadow-2xl shadow-indigo-100/50 lg:sticky lg:top-24 z-20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 text-center mb-6">
                            <span className="text-4xl block mb-3 drop-shadow-sm">📅</span>
                            <h3 className="font-bold text-slate-800 text-lg">Your Birth Date</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Select date to begin tracking</p>
                        </div>

                        <div className="relative mb-6">
                            {/* ADVANCED DATE PICKER */}
                            <AdvancedDatePicker onChange={setBirthDate} />
                        </div>

                        {/* Desktop Button */}
                        <button
                            onClick={calculateStats}
                            className="hidden md:flex w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 hover:shadow-lg hover:translate-y-[-2px] active:translate-y-[0px] transition-all justify-center items-center gap-2 group-hover:shadow-indigo-500/20"
                        >
                            Start Tracking 🚀
                        </button>
                    </div>
                    {/* RIGHT: RESULTS */}
                    <div id="result-section" className="lg:col-span-8 space-y-4 md:space-y-6">

                        {stats ? (
                            <div className="space-y-4 md:space-y-6 animate-fade-in-up">

                                {/* 1. HERO CARD (Responsive Font) */}
                                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-6 md:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

                                    <div className="relative z-10 text-center">
                                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Alive Time</p>

                                        {/* Responsive Text Size: text-4xl on mobile, text-7xl on PC */}
                                        <div className="text-4xl md:text-7xl font-black tracking-tight mb-3">
                                            {stats.years}<span className="text-lg md:text-2xl text-indigo-300 font-medium">y</span> {stats.months}<span className="text-lg md:text-2xl text-indigo-300 font-medium">m</span> {stats.days}<span className="text-lg md:text-2xl text-indigo-300 font-medium">d</span>
                                        </div>

                                        <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1 rounded-full font-mono text-lg md:text-xl text-indigo-100 border border-white/10">
                                            {stats.hours}h : {stats.minutes}m : <span className="text-white font-bold">{stats.seconds}s</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. STATS GRID (Mobile 2 cols, PC 3 cols) */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <div className="text-2xl mb-1">🎂</div>
                                        <div className="font-bold text-lg text-slate-900">{stats.daysToBday}</div>
                                        <div className="text-[10px] md:text-xs text-slate-400 uppercase font-bold">Days to B'day</div>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <div className="text-2xl mb-1">📅</div>
                                        <div className="font-bold text-lg text-slate-900">{stats.totalWeeks}</div>
                                        <div className="text-[10px] md:text-xs text-slate-400 uppercase font-bold">Weeks</div>
                                    </div>

                                    {/* Heartbeats (Full width on mobile) */}
                                    <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <div className="text-2xl mb-1">❤️</div>
                                        <div className="font-bold text-lg text-slate-900">{parseInt(stats.heartbeats).toLocaleString()}</div>
                                        <div className="text-[10px] md:text-xs text-slate-400 uppercase font-bold">Heartbeats</div>
                                    </div>
                                </div>

                                {/* 3. PLANETARY (Horizontal Scroll on Mobile) */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 md:p-8">
                                    <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2 text-sm md:text-base">
                                        <span>🚀</span> Age on other planets
                                    </h3>
                                    {/* Scrollable Container for Mobile */}
                                    <div className="flex overflow-x-auto pb-2 gap-3 md:grid md:grid-cols-3">
                                        <div className="min-w-[120px] bg-white p-4 rounded-xl border border-indigo-100 text-center flex-1">
                                            <p className="text-[10px] text-indigo-400 uppercase font-bold">Mars</p>
                                            <p className="text-xl font-black text-indigo-900">{(stats.years / 1.88).toFixed(1)}</p>
                                        </div>
                                        <div className="min-w-[120px] bg-white p-4 rounded-xl border border-indigo-100 text-center flex-1">
                                            <p className="text-[10px] text-indigo-400 uppercase font-bold">Jupiter</p>
                                            <p className="text-xl font-black text-indigo-900">{(stats.years / 11.86).toFixed(1)}</p>
                                        </div>
                                        <div className="min-w-[120px] bg-white p-4 rounded-xl border border-indigo-100 text-center flex-1">
                                            <p className="text-[10px] text-indigo-400 uppercase font-bold">Mercury</p>
                                            <p className="text-xl font-black text-indigo-900">{(stats.years / 0.24).toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            // EMPTY STATE
                            <div className="py-10 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <span className="text-4xl mb-2 animate-bounce">👆</span>
                                <p className="text-sm">Select birth date above</p>
                            </div>
                        )}

                        <AdUnit />
                    </div>
                </div>

                {/* --- SEO TEXT --- */}
                <article className="mt-10 md:mt-20 prose prose-slate max-w-none text-slate-500 mx-auto text-center text-sm">
                    <p>Precision Age Calculator for Next Gen Creators.</p>
                </article>

            </div>

            {/* --- MOBILE STICKY BUTTON (Only Visible on Mobile) --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50">
                <button
                    onClick={calculateStats}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    Calculate 🚀
                </button>
            </div>

        </div>
    );
}