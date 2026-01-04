'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, Scale, Ruler, Thermometer, Gauge, Beaker } from 'lucide-react';
import AdUnit from '@/components/AdUnit';

// Conversion Data Strategy:
// For most: Rate = Base Units per 1 Unit.
// Formula: Result = (Input * FromRate) / ToRate
const CONVERSION_DATA = {
    length: {
        inputs: {
            meter: { label: 'Meter (m)', rate: 1 },
            kilometer: { label: 'Kilometer (km)', rate: 1000 },
            centimeter: { label: 'Centimeter (cm)', rate: 0.01 },
            millimeter: { label: 'Millimeter (mm)', rate: 0.001 },
            mile: { label: 'Mile (mi)', rate: 1609.344 },
            yard: { label: 'Yard (yd)', rate: 0.9144 },
            foot: { label: 'Foot (ft)', rate: 0.3048 },
            inch: { label: 'Inch (in)', rate: 0.0254 },
        },
        icon: Ruler
    },
    weight: {
        inputs: {
            kilogram: { label: 'Kilogram (kg)', rate: 1 },
            gram: { label: 'Gram (g)', rate: 0.001 },
            milligram: { label: 'Milligram (mg)', rate: 0.000001 },
            pound: { label: 'Pound (lb)', rate: 0.453592 },
            ounce: { label: 'Ounce (oz)', rate: 0.0283495 },
        },
        icon: Scale
    },
    speed: {
        inputs: {
            mps: { label: 'Meter per second (m/s)', rate: 1 },
            kph: { label: 'Kilometer per hour (km/h)', rate: 0.277778 },
            mph: { label: 'Miles per hour (mph)', rate: 0.44704 },
            knot: { label: 'Knot (kn)', rate: 0.514444 },
        },
        icon: Gauge
    },
    volume: {
        inputs: {
            liter: { label: 'Liter (L)', rate: 1 },
            milliliter: { label: 'Milliliter (ml)', rate: 0.001 },
            gallon: { label: 'Gallon (US)', rate: 3.78541 },
            pint: { label: 'Pint (US)', rate: 0.473176 },
            cup: { label: 'Cup (US)', rate: 0.236588 },
        },
        icon: Beaker
    },
    temperature: {
        inputs: {
            celsius: { label: 'Celsius (°C)' },
            fahrenheit: { label: 'Fahrenheit (°F)' },
            kelvin: { label: 'Kelvin (K)' },
        },
        icon: Thermometer
    }
};

export default function UnitConverter() {
    const [category, setCategory] = useState('length');

    // Units
    const [unitA, setUnitA] = useState('meter');
    const [unitB, setUnitB] = useState('kilometer');

    // Values (Strings to handle empty inputs cleanly)
    const [valueA, setValueA] = useState('1');
    const [valueB, setValueB] = useState('');

    // Update units when category changes
    useEffect(() => {
        const keys = Object.keys(CONVERSION_DATA[category].inputs);
        setUnitA(keys[0]);
        setUnitB(keys[1] || keys[0]);
        setValueA('1');
    }, [category]);

    // Calculate B from A
    const calculate = (val, from, to, cat) => {
        if (val === '' || isNaN(val)) return '';
        const numVal = parseFloat(val);

        const categoryData = CONVERSION_DATA[cat];
        // Safety Check: Ensure the selected units exist in the current category
        // This prevents crashes when 'cat' switches but 'from/to' are still from the old category
        if (!categoryData?.inputs[from] || !categoryData?.inputs[to]) {
            return '';
        }

        if (cat === 'temperature') {
            // Temperature Formulas
            let celsius;
            // 1. Convert to Celsius
            if (from === 'celsius') celsius = numVal;
            else if (from === 'fahrenheit') celsius = (numVal - 32) * (5 / 9);
            else if (from === 'kelvin') celsius = numVal - 273.15;

            // 2. Convert from Celsius to Target
            if (to === 'celsius') return celsius;
            if (to === 'fahrenheit') return (celsius * 9 / 5) + 32;
            if (to === 'kelvin') return celsius + 273.15;
            return 0;
        } else {
            // Ratio Conversions
            const fromRate = categoryData.inputs[from].rate;
            const toRate = categoryData.inputs[to].rate;
            return (numVal * fromRate) / toRate;
        }
    };

    // Effects for Real-time Updates
    // We only trigger when 'A' changes to update 'B', or when units change.
    // To allow editing 'B', we might need more complex state, but usually standard converters drive Left -> Right.
    // Let's implement bidirectional update logic.

    // Actually, simpler to have one "source of truth" last edited or just update B when A changes.
    // Let's stick to A drives B for simplicity unless swapped.
    useEffect(() => {
        const result = calculate(valueA, unitA, unitB, category);
        if (result === '') setValueB('');
        else {
            // Limit decimals for cleanliness, but keep precision if small
            const output = parseFloat(result.toFixed(4));
            setValueB(output.toString());
        }
    }, [valueA, unitA, unitB, category]);

    const handleSwap = () => {
        setUnitA(unitB);
        setUnitB(unitA);
        setValueA(valueB);
        // valueB will automatically update via useEffect, but setting A to old B gives seamless swap feel
    };

    const CurrentIcon = CONVERSION_DATA[category].icon;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

            {/* Header */}
            <header className="py-8 px-4 bg-slate-900 border-b border-slate-800/50">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <Scale size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                            Universal Converter
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Precision conversion for common scientific units
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">

                {/* 1. Category Selector */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
                    {Object.keys(CONVERSION_DATA).map((cat) => {
                        const Icon = CONVERSION_DATA[cat].icon;
                        const isActive = category === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Icon size={16} />
                                <span className="capitalize">{cat}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 2. Converter Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-500"></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl">

                        <div className="flex flex-col md:flex-row items-center gap-6">

                            {/* Input A */}
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="number"
                                        value={valueA}
                                        onChange={(e) => setValueA(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-3xl font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
                                        placeholder="0"
                                    />
                                    <select
                                        value={unitA}
                                        onChange={(e) => setUnitA(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer hover:bg-slate-700/50 transition"
                                    >
                                        {Object.entries(CONVERSION_DATA[category].inputs).map(([key, data]) => (
                                            <option key={key} value={key}>{data.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Swap Action */}
                            <div className="relative z-10 -my-3 md:my-0">
                                <button
                                    onClick={handleSwap}
                                    className="p-3 bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 rounded-full text-slate-400 hover:text-white transition-all duration-300 shadow-lg group-hover:scale-110"
                                    title="Swap Units"
                                >
                                    <ArrowRightLeft size={24} />
                                </button>
                            </div>

                            {/* Input B */}
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Result</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="number"
                                        value={valueB}
                                        readOnly
                                        className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-4 text-3xl font-bold text-indigo-400 focus:outline-none font-mono cursor-not-allowed opacity-80"
                                        placeholder="0"
                                    />
                                    <select
                                        value={unitB}
                                        onChange={(e) => setUnitB(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer hover:bg-slate-700/50 transition"
                                    >
                                        {Object.entries(CONVERSION_DATA[category].inputs).map(([key, data]) => (
                                            <option key={key} value={key}>{data.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Common Conversions / Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 text-sm">
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                        <strong className="text-slate-300 block mb-2">Did you know?</strong>
                        Most of the world uses the Metric system, which is based on powers of 10, making calculations much easier than the Imperial system.
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                        <strong className="text-slate-300 block mb-2">Temperature Fact</strong>
                        -40 is the unique temperature where Celsius and Fahrenheit scales intersect. -40°C equals -40°F.
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                        <strong className="text-slate-300 block mb-2">Speed of Light</strong>
                        The speed of light is approximately 299,792,458 meters per second, or roughly 300,000 km/s.
                    </div>
                </div>

            </main>

            <div className="mt-8">
                <AdUnit />
            </div>
        </div>
    );
}
