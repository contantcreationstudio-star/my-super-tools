'use client';

import { useState, useMemo } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function GeometrySolver() {
    const [mode, setMode] = useState('2d'); // 2d, 3d
    const [shape, setShape] = useState(mode === '2d' ? 'circle' : 'cube');

    // Inputs Store
    const [inputs, setInputs] = useState({
        radius: '',
        length: '',
        width: '',
        height: '',
        side: '',
        siA: '', siB: '', siC: '' // Triangle sides
    });

    const handleModeChange = (m) => {
        setMode(m);
        setShape(m === '2d' ? 'circle' : 'cube');
        setInputs({ radius: '', length: '', width: '', height: '', side: '', siA: '', siB: '', siC: '' });
    };

    const handleInputChange = (field, val) => {
        setInputs(prev => ({ ...prev, [field]: val }));
    };

    // --- Calculation Logic ---
    const results = useMemo(() => {
        const { radius, length, width, height, side, siA, siB, siC } = inputs;
        const r = parseFloat(radius || 0);
        const l = parseFloat(length || 0);
        const w = parseFloat(width || 0);
        const h = parseFloat(height || 0);
        const s = parseFloat(side || 0);
        const a = parseFloat(siA || 0);
        const b = parseFloat(siB || 0);
        const c = parseFloat(siC || 0);

        let area = 0, perimeter = 0, volume = 0, surfaceArea = 0;
        let formula = '';

        if (mode === '2d') {
            switch (shape) {
                case 'circle':
                    if (r > 0) {
                        area = Math.PI * r * r;
                        perimeter = 2 * Math.PI * r;
                        formula = 'Area = πr²,  Perimeter = 2πr';
                    }
                    break;
                case 'rectangle':
                    if (l > 0 && w > 0) {
                        area = l * w;
                        perimeter = 2 * (l + w);
                        formula = 'Area = l × w,  Perimeter = 2(l + w)';
                    }
                    break;
                case 'square':
                    if (s > 0) {
                        area = s * s;
                        perimeter = 4 * s;
                        formula = 'Area = s²,  Perimeter = 4s';
                    }
                    break;
                case 'triangle':
                    if (a > 0 && b > 0 && c > 0) {
                        perimeter = a + b + c;
                        const p = perimeter / 2;
                        const val = p * (p - a) * (p - b) * (p - c);
                        if (val > 0) area = Math.sqrt(val);
                        formula = 'Perimeter = a+b+c,  Area = √[s(s-a)(s-b)(s-c)]';
                    }
                    break;
            }
        } else {
            // 3D
            switch (shape) {
                case 'cube':
                    if (s > 0) {
                        volume = Math.pow(s, 3);
                        surfaceArea = 6 * Math.pow(s, 2);
                        formula = 'Volume = s³,  Surface Area = 6s²';
                    }
                    break;
                case 'cylinder':
                    if (r > 0 && h > 0) {
                        volume = Math.PI * r * r * h;
                        surfaceArea = (2 * Math.PI * r * h) + (2 * Math.PI * r * r);
                        formula = 'Vol = πr²h,  SA = 2πrh + 2πr²';
                    }
                    break;
                case 'sphere':
                    if (r > 0) {
                        volume = (4 / 3) * Math.PI * Math.pow(r, 3);
                        surfaceArea = 4 * Math.PI * r * r;
                        formula = 'Vol = 4/3πr³,  SA = 4πr²';
                    }
                    break;
                case 'cone':
                    if (r > 0 && h > 0) {
                        volume = (1 / 3) * Math.PI * r * r * h;
                        const sSlant = Math.sqrt(h * h + r * r);
                        surfaceArea = Math.PI * r * (r + sSlant);
                        formula = 'Vol = 1/3πr²h,  SA = πr(r + √(h²+r²))';
                    }
                    break;
            }
        }

        return {
            area: area.toFixed(2),
            perimeter: perimeter.toFixed(2),
            volume: volume.toFixed(2),
            surfaceArea: surfaceArea.toFixed(2),
            formula
        };
    }, [mode, shape, inputs]);

    return (
        <div className="min-h-screen bg-indigo-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Geometry <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Solver</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Calculate Area, Volume & Surface Area instantly.</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 inline-flex">
                        <TabBtn label="2D Shapes" active={mode === '2d'} onClick={() => handleModeChange('2d')} />
                        <TabBtn label="3D Objects" active={mode === '3d'} onClick={() => handleModeChange('3d')} />
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">

                    {/* Input Panel */}
                    <div className="md:col-span-7 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-900/5 border border-indigo-50">

                            {/* Shape Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Select Shape</label>
                                <select
                                    value={shape}
                                    onChange={(e) => {
                                        setShape(e.target.value);
                                        setInputs({ radius: '', length: '', width: '', height: '', side: '', siA: '', siB: '', siC: '' });
                                    }}
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold text-slate-800 outline-none focus:border-indigo-500 bg-slate-50"
                                >
                                    {mode === '2d' ? (
                                        <>
                                            <option value="circle">Circle</option>
                                            <option value="rectangle">Rectangle</option>
                                            <option value="square">Square</option>
                                            <option value="triangle">Triangle</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="cube">Cube</option>
                                            <option value="cylinder">Cylinder</option>
                                            <option value="sphere">Sphere</option>
                                            <option value="cone">Cone</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Dynamic Fields */}
                            <div className="space-y-4">
                                {(shape === 'circle' || shape === 'cylinder' || shape === 'sphere' || shape === 'cone') && (
                                    <InputBox label="Radius (r)" val={inputs.radius} setVal={(v) => handleInputChange('radius', v)} />
                                )}
                                {(shape === 'rectangle') && (
                                    <>
                                        <InputBox label="Length (l)" val={inputs.length} setVal={(v) => handleInputChange('length', v)} />
                                        <InputBox label="Width (w)" val={inputs.width} setVal={(v) => handleInputChange('width', v)} />
                                    </>
                                )}
                                {(shape === 'square' || shape === 'cube') && (
                                    <InputBox label="Side Length (s)" val={inputs.side} setVal={(v) => handleInputChange('side', v)} />
                                )}
                                {(shape === 'triangle') && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputBox label="Side A" val={inputs.siA} setVal={(v) => handleInputChange('siA', v)} />
                                        <InputBox label="Side B" val={inputs.siB} setVal={(v) => handleInputChange('siB', v)} />
                                        <InputBox label="Side C" val={inputs.siC} setVal={(v) => handleInputChange('siC', v)} />
                                    </div>
                                )}
                                {(shape === 'cylinder' || shape === 'cone') && (
                                    <InputBox label="Height (h)" val={inputs.height} setVal={(v) => handleInputChange('height', v)} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl shadow-indigo-500/30 relative overflow-hidden min-h-[300px] flex flex-col justify-center">

                            {/* Decorative */}
                            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                            {results.formula && (
                                <div className="absolute top-6 left-6 right-6">
                                    <span className="inline-block px-3 py-1 rounded bg-indigo-500/50 border border-indigo-400/30 text-xs font-mono text-indigo-100 mb-2">
                                        FORMULA
                                    </span>
                                    <p className="font-mono text-sm text-indigo-100 opacity-90">{results.formula}</p>
                                </div>
                            )}

                            <div className="mt-12 space-y-6">
                                {mode === '2d' ? (
                                    <>
                                        <div>
                                            <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">Area</div>
                                            <div className="text-5xl font-black">{results.area}</div>
                                        </div>
                                        <div className="w-full h-px bg-indigo-500/50"></div>
                                        <div>
                                            <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">Perimeter</div>
                                            <div className="text-3xl font-bold opacity-90">{results.perimeter}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">Volume</div>
                                            <div className="text-5xl font-black">{results.volume}</div>
                                        </div>
                                        <div className="w-full h-px bg-indigo-500/50"></div>
                                        <div>
                                            <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">Surface Area</div>
                                            <div className="text-3xl font-bold opacity-90">{results.surfaceArea}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <HowToUse />

                <div className="mt-12">
                    <AdUnit />
                </div>
            </div>
        </div>
    );
}

// --- How To Use Section ---
function HowToUse() {
    return (
        <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">💡</span> How to use
            </h3>
            <div className="space-y-6 text-slate-600 leading-relaxed">
                <div>
                    <h4 className="font-bold text-indigo-600 mb-1">1. Choose Mode</h4>
                    <p>Select <strong>2D Shapes</strong> (for Area/Perimeter) or <strong>3D Objects</strong> (for Volume/Surface Area).</p>
                </div>
                <div>
                    <h4 className="font-bold text-indigo-600 mb-1">2. Select Shape</h4>
                    <p>Pick a shape from the dropdown menu (e.g., Circle, Cylinder, Cube).</p>
                </div>
                <div>
                    <h4 className="font-bold text-indigo-600 mb-1">3. Enter Values</h4>
                    <p>Type in the required dimensions (like Radius, Height, or Side Length). Results appear instantly!</p>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function TabBtn({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                }`}
        >
            {label}
        </button>
    );
}

function InputBox({ label, val, setVal }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{label}</label>
            <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-lg text-slate-800 transition-all bg-slate-50 focus:bg-white"
                placeholder="0"
            />
        </div>
    );
}
