'use client';

import { useState, useRef, useEffect } from 'react';

export default function AdvancedDatePicker({ onChange }) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    useEffect(() => {
        // Validate and format: YYYY-MM-DD
        if (day && month && year && year.length === 4) {
            const d = day.padStart(2, '0');
            const m = month.padStart(2, '0');
            onChange(`${year}-${m}-${d}`);
        } else {
            onChange('');
        }
    }, [day, month, year, onChange]);

    const handleDayChange = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // Only numbers
        if (val.length <= 2) {
            setDay(val);
            if (val.length === 2 && val > 0 && val <= 31) {
                monthRef.current.focus();
            }
        }
    };

    const handleMonthChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 2) {
            setMonth(val);
            if (val.length === 2 && val > 0 && val <= 12) {
                yearRef.current.focus();
            }
        }
    };

    const handleYearChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 4) {
            setYear(val);
        }
    };

    const handleKeyDown = (e, prevRef, currentVal) => {
        if (e.key === 'Backspace' && currentVal === '' && prevRef) {
            prevRef.current.focus();
        }
    };

    return (
        <div className="flex justify-center items-center gap-1 md:gap-4 p-2 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all cursor-text overflow-hidden" onClick={() => dayRef.current.focus()}>

            {/* DAY */}
            <div className="relative group">
                <input
                    ref={dayRef}
                    type="number"
                    pattern="\d*"
                    placeholder="DD"
                    value={day}
                    onChange={handleDayChange}
                    onKeyDown={(e) => handleKeyDown(e, null, day)}
                    className="w-12 md:w-20 text-center text-xl md:text-3xl font-black text-slate-800 bg-transparent outline-none placeholder-slate-300 appearance-none"
                />
                <label className="block text-[8px] md:text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider mt-1 group-focus-within:text-indigo-500">Day</label>
            </div>

            <span className="text-xl md:text-2xl text-slate-300 font-light">/</span>

            {/* MONTH */}
            <div className="relative group">
                <input
                    ref={monthRef}
                    type="number"
                    pattern="\d*"
                    placeholder="MM"
                    value={month}
                    onChange={handleMonthChange}
                    onKeyDown={(e) => handleKeyDown(e, dayRef, month)}
                    className="w-12 md:w-20 text-center text-xl md:text-3xl font-black text-slate-800 bg-transparent outline-none placeholder-slate-300 appearance-none"
                />
                <label className="block text-[8px] md:text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider mt-1 group-focus-within:text-indigo-500">Month</label>
            </div>

            <span className="text-xl md:text-2xl text-slate-300 font-light">/</span>

            {/* YEAR */}
            <div className="relative group">
                <input
                    ref={yearRef}
                    type="number"
                    pattern="\d*"
                    placeholder="YYYY"
                    value={year}
                    onChange={handleYearChange}
                    onKeyDown={(e) => handleKeyDown(e, monthRef, year)}
                    className="w-20 md:w-32 text-center text-xl md:text-3xl font-black text-slate-800 bg-transparent outline-none placeholder-slate-300 appearance-none"
                />
                <label className="block text-[8px] md:text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider mt-1 group-focus-within:text-indigo-500">Year</label>
            </div>

        </div>
    );
}
