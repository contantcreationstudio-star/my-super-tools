'use client';

import { useState, useRef, useEffect } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function SignaturePad() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [thickness, setThickness] = useState(3);
    const [hasContent, setHasContent] = useState(false);

    // Setup Canvas Resolution
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

                // Resize
                canvas.width = parent.offsetWidth;
                canvas.height = 300; // Fixed height for signature area

                // Restore settings
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Restore content (scaled if needed, but simple restore is okay for minor resize)
                // For a signature pad, clearing on resize is distinct, but we'll try to keep it blank or clean.
                // Or better: Just clear it to avoid distortion, standard for resize.
                // Users usually sign *after* layout settles.
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Update Brush Settings
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness;
        }
    }, [color, thickness]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        const { x, y } = getPos(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
        if (!hasContent) setHasContent(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasContent(false);
    };

    const downloadSignature = () => {
        if (!hasContent) {
            alert('Please draw a signature first!');
            return;
        }
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `signature-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png'); // Default is transparent PNG
        link.click();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-300 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
                        E-Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-800">Pad</span>
                    </h1>
                    <p className="text-slate-500">Draw a professional signature and download as transparent PNG.</p>
                </div>

                <div className="bg-white rounded-3xl p-1 shadow-2xl shadow-slate-200 border border-slate-100">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex flex-wrap gap-6 items-center justify-center bg-slate-50/50 rounded-t-3xl">

                        {/* Colors */}
                        <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Ink</span>
                            {['#000000', '#2563eb', '#dc2626'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-800 scale-110 ring-2 ring-slate-200' : 'border-white shadow-sm'}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Color ${c}`}
                                />
                            ))}
                        </div>

                        {/* Thickness */}
                        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                            {[1, 3, 5].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setThickness(t)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${thickness === t ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {t === 1 ? 'Thin' : t === 3 ? 'Medium' : 'Bold'}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={clearCanvas}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="relative w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] bg-white cursor-crosshair">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="block w-full touch-none"
                            style={{ minHeight: '300px' }}
                        />
                        {!hasContent && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                                <span className="text-4xl font-cursive text-slate-400 font-bold italic">Sign Here</span>
                            </div>
                        )}
                    </div>

                    {/* Footer / Download */}
                    <div className="p-4 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex justify-center">
                        <button
                            onClick={downloadSignature}
                            className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-slate-400/20 transform active:scale-95 flex items-center gap-2 ${hasContent ? 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-1' : 'bg-slate-300 cursor-not-allowed'}`}
                        >
                            <span>📥</span> Download Transparent PNG
                        </button>
                    </div>

                </div>

                <div className="mt-16">
                    <AdUnit />
                </div>
            </div>
        </div>
    );
}
