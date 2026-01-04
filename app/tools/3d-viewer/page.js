'use client';

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, OrbitControls, useGLTF, Html, Loader } from '@react-three/drei';
import AdUnit from '../../../components/AdUnit';

function Model({ url }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

function LoaderSpinner() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-cyan-400 text-xs font-bold animate-pulse">LOADING 3D ASSETS...</p>
            </div>
        </Html>
    );
}

export default function ThreeDViewer() {
    const [fileUrl, setFileUrl] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [autoRotate, setAutoRotate] = useState(true);
    const [error, setError] = useState(null);

    const handleFileUpload = (file) => {
        if (!file) return;

        const validExtensions = ['glb', 'gltf'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(extension)) {
            setError("Invalid file type. Please upload .glb or .gltf files.");
            return;
        }

        setError(null);
        setFileName(file.name);
        const url = URL.createObjectURL(file);
        setFileUrl(url);
    };

    const onDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const onFileSelect = (e) => {
        const file = e.target.files?.[0];
        handleFileUpload(file);
    };

    const resetViewer = () => {
        if (fileUrl) URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
        setFileName(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Cyberpunk Header */}
            <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 text-2xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                            🧊
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">
                                3D <span className="text-cyan-400">VIEWER</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Interactive GLB/GLTF Inspector</p>
                        </div>
                    </div>
                    {fileName && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-mono text-cyan-200">{fileName}</span>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* 3D Viewport or Upload Area */}
                <div className="relative w-full h-[600px] bg-black/40 rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm group">

                    {/* Grid Background Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

                    {fileUrl ? (
                        <>
                            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                                <Suspense fallback={<LoaderSpinner />}>
                                    <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.5, blur: 2 }}>
                                        <Model url={fileUrl} />
                                    </Stage>
                                </Suspense>
                                <OrbitControls autoRotate={autoRotate} makeDefault />
                            </Canvas>

                            {/* Overlay Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                                <button
                                    onClick={() => setAutoRotate(!autoRotate)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${autoRotate ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-white/10 text-slate-400'
                                        }`}
                                >
                                    <svg className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Auto-Rotate
                                </button>
                                <div className="w-[1px] h-6 bg-white/10"></div>
                                <button
                                    onClick={resetViewer}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 border border-transparent hover:border-red-500/30"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Close File
                                </button>
                            </div>
                        </>
                    ) : (
                        // Drop Zone
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className="absolute inset-0 flex flex-col items-center justify-center z-10"
                        >
                            <label className="cursor-pointer group/upload">
                                <input type="file" onChange={onFileSelect} className="hidden" accept=".glb,.gltf" />
                                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border-2 border-dashed border-white/10 group-hover/upload:border-cyan-500/50 group-hover/upload:bg-cyan-500/5 transition-all duration-300 mb-6 relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover/upload:opacity-50 transition-opacity duration-500"></div>
                                    <span className="text-4xl relative z-10 group-hover/upload:scale-110 transition-transform duration-300">📦</span>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold text-white group-hover/upload:text-cyan-400 transition-colors">
                                        Drop 3D Model Here
                                    </h3>
                                    <p className="text-slate-500 font-medium">Supports .GLB and .GLTF</p>
                                </div>
                            </label>

                            {error && (
                                <div className="mt-8 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                {!fileUrl && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-xl mb-4 text-purple-400">⚡</div>
                            <h3 className="font-bold text-white mb-2">Instant Preview</h3>
                            <p className="text-sm text-slate-400">Drag and drop your files for immediate rendering without uploading to any server.</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl mb-4 text-cyan-400">🔄</div>
                            <h3 className="font-bold text-white mb-2">Interactive Control</h3>
                            <p className="text-sm text-slate-400">Rotate, zoom, and pan around your models to inspect every detail.</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-xl mb-4 text-green-400">🔒</div>
                            <h3 className="font-bold text-white mb-2">100% Local</h3>
                            <p className="text-sm text-slate-400">Your files never leave your device. Complete privacy and security guaranteed.</p>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <AdUnit />
                </div>
            </main>
        </div>
    );
}
