'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import AdUnit from '../../../components/AdUnit';

export default function WifiQrGenerator() {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [encryption, setEncryption] = useState('WPA');
    const [hidden, setHidden] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const qrRef = useRef(null);

    // Construct WiFi string format: WIFI:T:WPA;S:mynetwork;P:mypass;;
    const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${ssid || 'wifi'}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const printCard = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-500 selection:text-white print:bg-white">

            {/* Printable Area Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-card, #printable-card * {
            visibility: visible;
          }
          #printable-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 400px;
            border: 2px solid #000;
            padding: 40px;
            border-radius: 20px;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12 sm:mb-16 no-print">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        WiFi <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">QR Code</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Create a custom QR code for your guest network. Scan to connect instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Input Section */}
                    <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl shadow-cyan-900/5 p-8 border border-slate-100 no-print">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl">⚙️</span>
                            Network Details
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Network Name (SSID)</label>
                                <input
                                    type="text"
                                    value={ssid}
                                    onChange={(e) => setSsid(e.target.value)}
                                    placeholder="e.g. MyHomeWiFi"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your secure password"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400 pr-12"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors p-1"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Processed locally 100% secure.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Encryption</label>
                                    <div className="relative">
                                        <select
                                            value={encryption}
                                            onChange={(e) => setEncryption(e.target.value)}
                                            className="w-full appearance-none px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-medium text-slate-800 bg-white"
                                        >
                                            <option value="WPA">WPA/WPA2</option>
                                            <option value="WEP">WEP</option>
                                            <option value="nopass">None</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end mb-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={hidden}
                                            onChange={(e) => setHidden(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 transition-colors"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-cyan-700 transition-colors">Hidden Network?</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* The Output Card */}
                        <div id="printable-card" className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 sm:p-10 shadow-2xl text-white flex flex-col items-center justify-center text-center relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                            {/* Decorative background circles */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-300 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                            <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 relative z-10" ref={qrRef}>
                                <QRCodeCanvas
                                    value={wifiString}
                                    size={256}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"Q"}
                                    includeMargin={false}
                                />
                            </div>

                            <h3 className="text-2xl font-bold mb-1 relative z-10">{ssid || "Your Network"}</h3>
                            <p className="text-cyan-100 font-medium mb-6 relative z-10 opacity-90">Scan to Connect</p>

                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/30 relative z-10">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span>{encryption === 'nopass' ? 'Open Network' : 'Encrypted Connection'}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
                            <button
                                onClick={downloadQR}
                                className="flex justify-center items-center gap-2 w-full py-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 transition-all shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download PNG
                            </button>
                            <button
                                onClick={printCard}
                                className="flex justify-center items-center gap-2 w-full py-4 bg-slate-900 rounded-xl font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Print WiFi Card
                            </button>
                        </div>

                        <div className="no-print">
                            <AdUnit />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
