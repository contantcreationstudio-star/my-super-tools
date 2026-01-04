'use client';

import { useState } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function ImageConverter() {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [targetFormat, setTargetFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(0.9);
    const [scale, setScale] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Process a single file
    const processFile = async (file) => {
        try {
            let sourceBlob = file;
            let sourceUrl = URL.createObjectURL(file);

            // Dynamically import libraries
            const heic2any = (await import('heic2any')).default;
            const { jsPDF } = await import('jspdf');

            // 1. Handle HEIC/HEIF
            if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 1
                });
                sourceBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                sourceUrl = URL.createObjectURL(sourceBlob);
            }

            // 2. Load into Image
            const img = new Image();
            img.src = sourceUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // 3. Canvas Resizing & Conversion
            const canvas = document.createElement('canvas');
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // 4. Output Generation
            let outputUrl;
            let outputExt;

            if (targetFormat === 'application/pdf') {
                const pdf = new jsPDF({
                    orientation: newWidth > newHeight ? 'l' : 'p',
                    unit: 'px',
                    format: [newWidth, newHeight]
                });
                pdf.addImage(canvas.toDataURL('image/jpeg', quality), 'JPEG', 0, 0, newWidth, newHeight);
                const pdfBlob = pdf.output('blob');
                outputUrl = URL.createObjectURL(pdfBlob);
                outputExt = 'pdf';
            } else {
                outputUrl = canvas.toDataURL(targetFormat, quality);
                outputExt = targetFormat.split('/')[1];
                if (outputExt === 'jpeg') outputExt = 'jpg';
            }

            // Cleanup
            URL.revokeObjectURL(sourceUrl);

            return {
                originalName: file.name,
                name: file.name.replace(/\.[^/.]+$/, "") + `_converted.${outputExt}`,
                url: outputUrl,
                status: 'done',
                size: sourceBlob.size // approximate
            };

        } catch (error) {
            console.error("Error processing file", file.name, error);
            return {
                originalName: file.name,
                status: 'error',
                error: error.message
            };
        }
    };

    const handleFiles = async (newFiles) => {
        const waitingFiles = Array.from(newFiles).map(f => ({
            originalFile: f,
            originalName: f.name, // Added this property
            name: f.name,
            status: 'waiting',
            id: Math.random().toString(36).substr(2, 9)
        }));

        setFiles(prev => [...prev, ...waitingFiles]);
    };

    const convertAll = async () => {
        setIsProcessing(true);
        const newFilesState = [...files];

        for (let i = 0; i < newFilesState.length; i++) {
            if (newFilesState[i].status === 'waiting' || newFilesState[i].status === 'error') {
                newFilesState[i] = { ...newFilesState[i], status: 'processing' };
                setFiles([...newFilesState]); // Update UI to show processing

                const result = await processFile(newFilesState[i].originalFile);

                newFilesState[i] = {
                    ...newFilesState[i],
                    ...result,
                    status: result.status === 'error' ? 'error' : 'done'
                };
                setFiles([...newFilesState]);
            }
        }
        setIsProcessing(false);
    };

    const clearAll = () => {
        files.forEach(f => {
            if (f.url) URL.revokeObjectURL(f.url);
        });
        setFiles([]);
    };

    // Removal of a single file
    const removeFile = (id) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove?.url) URL.revokeObjectURL(fileToRemove.url);
            return prev.filter(f => f.id !== id);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Converter</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Convert HEIC, JPG, PNG to any format. Resize & Compress locally in your browser.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Controls & Upload */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Settings Panel */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-900/5 p-6 border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="text-xl">⚙️</span> Settings
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Format</label>
                                    <select
                                        value={targetFormat}
                                        onChange={(e) => setTargetFormat(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 bg-white"
                                    >
                                        <option value="image/jpeg">JPG / JPEG</option>
                                        <option value="image/png">PNG</option>
                                        <option value="image/webp">WEBP</option>
                                        <option value="application/pdf">PDF</option>
                                    </select>
                                </div>

                                {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                                    <div>
                                        <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                            <span>Quality</span>
                                            <span className="text-indigo-600">{Math.round(quality * 100)}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Resize: {Math.round(scale * 100)}%</label>
                                    <div className="flex gap-2">
                                        {[1, 0.75, 0.5, 0.25].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setScale(s)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${scale === s
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {s * 100}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Zone */}
                        <div
                            className={`border-4 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
                            }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                multiple
                                accept="image/*,.heic,.heif"
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                                🖼️
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Drop images here</h3>
                            <p className="text-slate-500 font-medium">or click to browse</p>
                            <p className="text-xs text-slate-400 mt-4">Supports JPG, PNG, WEBP, SVG, HEIC</p>
                        </div>

                        <div className="lg:hidden">
                            <AdUnit />
                        </div>
                    </div>

                    {/* File List & Results */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 min-h-[500px] flex flex-col">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
                                <h2 className="font-bold text-slate-700">Files ({files.length})</h2>
                                {files.length > 0 && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={clearAll}
                                            className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={convertAll}
                                            disabled={isProcessing}
                                            className={`px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all ${isProcessing
                                                ? 'bg-slate-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'
                                                }`}
                                        >
                                            {isProcessing ? 'Converting...' : 'Convert All'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* List */}
                            <div className="p-6 flex-1 overflow-y-auto max-h-[800px] space-y-4">
                                {files.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-4xl grayscale opacity-50">
                                            ✨
                                        </div>
                                        <p className="text-lg font-medium">No files selected yet</p>
                                    </div>
                                ) : (
                                    files.map((file) => (
                                        <div key={file.id} className="group relative bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-4">
                                            {/* Status Icon */}
                                            <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-xl bg-white shadow-sm border border-slate-100">
                                                {file.status === 'done' ? '✅' :
                                                    file.status === 'processing' ? '⏳' :
                                                        file.status === 'error' ? '❌' : '📄'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 truncate">{file.originalName}</h4>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                    <span className="uppercase">{file.originalName.split('.').pop()}</span>
                                                    <span>→</span>
                                                    <span className="uppercase text-indigo-600">{targetFormat.split('/')[1] === 'jpeg' ? 'JPG' : targetFormat.split('/')[1]}</span>
                                                    {file.status === 'done' && (
                                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                            Done
                                                        </span>
                                                    )}
                                                    {file.status === 'error' && (
                                                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                                            {file.error || 'Failed'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {file.status === 'done' && (
                                                    <a
                                                        href={file.url}
                                                        download={file.name}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold text-sm flex items-center gap-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        <span className="hidden sm:inline">Download</span>
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:block mt-8">
                            <AdUnit />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
