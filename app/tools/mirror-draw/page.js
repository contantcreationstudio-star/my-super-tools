'use client';

import { useState, useRef, useEffect } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function MirrorDraw() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#d946ef'); // Fuchsia-500
    const [brushSize, setBrushSize] = useState(4);
    const [symmetry, setSymmetry] = useState('quad'); // vertical, horizontal, quad, kaleidoscope
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Setup Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // precise sizing
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetWidth; // Square aspect ratio

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Update context settings when state changes
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
    }, [color, brushSize]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault(); // prevent scrolling on touch
        setIsDrawing(true);
        setLastPos(getPos(e));
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const ctx = canvasRef.current.getContext('2d');
        const currentPos = getPos(e);
        const { width, height } = canvasRef.current;
        const cx = width / 2;
        const cy = height / 2;

        ctx.beginPath();

        const drawLine = (p1, p2) => {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        };

        // 1. Original Stroke
        drawLine(lastPos, currentPos);

        // 2. Symmetry Logic
        if (symmetry === 'vertical' || symmetry === 'quad' || symmetry === 'kaleidoscope') {
            drawLine(
                { x: width - lastPos.x, y: lastPos.y },
                { x: width - currentPos.x, y: currentPos.y }
            );
        }

        if (symmetry === 'horizontal' || symmetry === 'quad' || symmetry === 'kaleidoscope') {
            drawLine(
                { x: lastPos.x, y: height - lastPos.y },
                { x: currentPos.x, y: height - currentPos.y }
            );
        }

        if (symmetry === 'quad' || symmetry === 'kaleidoscope') {
            drawLine(
                { x: width - lastPos.x, y: height - lastPos.y },
                { x: width - currentPos.x, y: height - currentPos.y }
            );
        }

        // Kaleidoscope (8-way: rotate 90 degrees/swap x,y relative to center)
        if (symmetry === 'kaleidoscope') {
            // Helper to rotate point around center
            const rotate = (p, angle) => {
                const rx = p.x - cx;
                const ry = p.y - cy;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                return {
                    x: (rx * cos - ry * sin) + cx,
                    y: (rx * sin + ry * cos) + cy
                };
            };

            // We already did 4 quadrants. Now we need the 45-degree offsets (x,y swapped effectively)
            // Or simpler: just rotate all 4 existing points by 90 degrees? No, 8-way is 4 axes.
            // Let's explicitly draw the diagonal reflections.

            // Reflect across y=x (swap x and y relative to center)
            const reflectDiag = (p) => ({
                x: (p.y - cy) + cx,
                y: (p.x - cx) + cy
            });

            drawLine(reflectDiag(lastPos), reflectDiag(currentPos));

            // And reflect that one across X and Y based on previous logic...
            const p1 = reflectDiag(lastPos);
            const p2 = reflectDiag(currentPos);

            drawLine({ x: width - p1.x, y: p1.y }, { x: width - p2.x, y: p2.y }); // V
            drawLine({ x: p1.x, y: height - p1.y }, { x: p2.x, y: height - p2.y }); // H
            drawLine({ x: width - p1.x, y: height - p1.y }, { x: width - p2.x, y: height - p2.y }); // Q
        }

        ctx.stroke();
        setLastPos(currentPos);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadArt = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `magic-mirror-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="min-h-screen bg-fuchsia-50 font-sans selection:bg-fuchsia-500 selection:text-white pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                        Magic <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600">Mirror Draw</span>
                    </h1>
                    <p className="text-slate-600">Relax and create beautiful mandalas instantly.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Controls Sidebar */}
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8 bg-white p-6 rounded-3xl shadow-xl shadow-fuchsia-900/5 border border-fuchsia-100">

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Symmetry Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <ModeBtn mode="vertical" icon="↕️" current={symmetry} set={setSymmetry} label="Vert" />
                                <ModeBtn mode="horizontal" icon="↔️" current={symmetry} set={setSymmetry} label="Horz" />
                                <ModeBtn mode="quad" icon="✥" current={symmetry} set={setSymmetry} label="Quad" />
                                <ModeBtn mode="kaleidoscope" icon="❄️" current={symmetry} set={setSymmetry} label="Mandala" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brush Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {['#000000', '#dc2626', '#d946ef', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brush Size: {brushSize}px</label>
                            <input
                                type="range" min="1" max="50"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <button
                                onClick={clearCanvas}
                                className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Clear Canvas
                            </button>
                            <button
                                onClick={downloadArt}
                                className="w-full py-3 rounded-xl font-bold bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-500/30 transition-all hover:-translate-y-1"
                            >
                                Download Art 🖼️
                            </button>
                        </div>

                        <div className="text-xs text-slate-400 text-center">
                            Tip: Try 'Mandala' mode for best results!
                        </div>

                    </div>

                    {/* Canvas Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 p-2 md:p-4 border border-slate-100 relative group">
                            <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-fuchsia-200 transition-colors bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-full cursor-crosshair touch-none"
                                />
                            </div>
                            <div className="absolute top-6 right-6 pointer-events-none opacity-50">
                                <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-slate-400 border border-slate-200 block">
                                    {symmetry.toUpperCase()} MODE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <AdUnit />
                </div>
            </div>
        </div>
    );
}

function ModeBtn({ mode, icon, current, set, label }) {
    const active = current === mode;
    return (
        <button
            onClick={() => set(mode)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${active
                ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                : 'border-slate-100 text-slate-500 hover:border-fuchsia-200 hover:bg-white'
                }`}
        >
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </button>
    );
}
