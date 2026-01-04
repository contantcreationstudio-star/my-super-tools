'use client';

import { useState, useMemo } from 'react';
import AdUnit from '../../../components/AdUnit';

export default function DiscountCalculator() {
    const [dealType, setDealType] = useState('percent'); // percent, bogo, fixed

    // Inputs
    const [price, setPrice] = useState('');
    const [percentOff, setPercentOff] = useState(20);
    const [fixedOff, setFixedOff] = useState('');
    const [buyQty, setBuyQty] = useState(1);
    const [getFreeQty, setGetFreeQty] = useState(1);
    const [unitPrice, setUnitPrice] = useState('');

    // --- Calculation Logic ---
    const results = useMemo(() => {
        let totalPayable = 0;
        let originalPrice = 0;
        let savings = 0;
        let effectivePercent = 0;

        if (dealType === 'percent') {
            if (price) {
                originalPrice = parseFloat(price);
                savings = originalPrice * (percentOff / 100);
                totalPayable = originalPrice - savings;
                effectivePercent = percentOff;
            }
        } else if (dealType === 'fixed') {
            if (price && fixedOff) {
                originalPrice = parseFloat(price);
                savings = parseFloat(fixedOff);
                totalPayable = originalPrice - savings;
                effectivePercent = (savings / originalPrice) * 100;
            }
        } else if (dealType === 'bogo') {
            if (unitPrice && buyQty && getFreeQty) {
                const p = parseFloat(unitPrice);
                const totalItems = parseInt(buyQty) + parseInt(getFreeQty);
                // In "Buy X Get Y Free", you pay for X items
                totalPayable = p * parseInt(buyQty);
                originalPrice = p * totalItems; // Value of all items
                savings = originalPrice - totalPayable;
                effectivePercent = (savings / originalPrice) * 100;
            }
        }

        return {
            payable: totalPayable > 0 ? totalPayable : 0,
            original: originalPrice > 0 ? originalPrice : 0,
            savings: savings > 0 ? savings : 0,
            percent: effectivePercent > 0 ? effectivePercent : 0
        };
    }, [dealType, price, percentOff, fixedOff, buyQty, getFreeQty, unitPrice]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="min-h-screen bg-rose-50 font-sans selection:bg-rose-500 selection:text-white pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Shopping <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Deal Calculator</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Decode "Buy 1 Get 1" offers and find the real value of any deal.
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-8">

                    {/* Input Section */}
                    <div className="md:col-span-7 space-y-8">

                        {/* Deal Selector */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-rose-100 flex overflow-x-auto">
                            <DealTypeBtn id="percent" label="% Off" icon="🏷️" active={dealType} onClick={setDealType} />
                            <DealTypeBtn id="bogo" label="Buy X Get Y" icon="🎁" active={dealType} onClick={setDealType} />
                            <DealTypeBtn id="fixed" label="Fixed Off" icon="💰" active={dealType} onClick={setDealType} />
                        </div>

                        {/* Dynamic Inputs */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-rose-900/5 border border-rose-100 space-y-6">

                            {dealType === 'percent' && (
                                <>
                                    <InputSimple label="Original Price (₹)" value={price} setValue={setPrice} placeholder="1000" />
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="font-bold text-slate-700">Discount Percentage</label>
                                            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">{percentOff}%</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="99" value={percentOff}
                                            onChange={(e) => setPercentOff(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                        />
                                    </div>
                                </>
                            )}

                            {dealType === 'fixed' && (
                                <>
                                    <InputSimple label="Original Price (₹)" value={price} setValue={setPrice} placeholder="1000" />
                                    <InputSimple label="Discount Amount (₹)" value={fixedOff} setValue={setFixedOff} placeholder="200" />
                                </>
                            )}

                            {dealType === 'bogo' && (
                                <>
                                    <InputSimple label="Unit Price (1 Item) ₹" value={unitPrice} setValue={setUnitPrice} placeholder="500" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputSimple label="Buy (Qty)" value={buyQty} setValue={setBuyQty} type="number" placeholder="2" />
                                        <InputSimple label="Get Free (Qty)" value={getFreeQty} setValue={setGetFreeQty} type="number" placeholder="1" />
                                    </div>
                                    <div className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        Example: For "Buy 2 Get 1 Free", enter Buy: 2, Free: 1.
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="bg-rose-600 text-white p-8 rounded-3xl shadow-xl shadow-rose-500/20 relative overflow-hidden">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <h3 className="text-rose-100 font-medium mb-1 uppercase tracking-wider text-sm">Total Payable</h3>
                                <div className="text-5xl font-black mb-6">{formatCurrency(results.payable)}</div>

                                <div className="space-y-3 pt-6 border-t border-rose-500/50">
                                    <div className="flex justify-between items-center text-rose-100">
                                        <span>Original Value</span>
                                        <span className="line-through opacity-70">{formatCurrency(results.original)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-white text-lg">
                                        <span>Total Savings</span>
                                        <span>{formatCurrency(results.savings)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Effective Deal Score */}
                        <div className={`p-8 rounded-3xl border-2 transition-all ${results.percent > 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-100 text-slate-400'}`}>
                            <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">Effective Discount</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">
                                    {results.percent.toFixed(1)}%
                                </span>
                                <span className="font-bold">OFF</span>
                            </div>
                            {dealType === 'bogo' && results.percent > 0 && (
                                <p className="mt-2 text-sm font-medium opacity-80">
                                    That "Buy {buyQty} Get {getFreeQty}" deal is actually just <strong>{results.percent.toFixed(0)}% off</strong>!
                                </p>
                            )}
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
                    <h4 className="font-bold text-rose-500 mb-1">1. Percentage Off</h4>
                    <p>Use this for simple discounts like "20% Off". Enter the original price and use the slider to set the percentage.</p>
                </div>
                <div>
                    <h4 className="font-bold text-rose-500 mb-1">2. Buy X Get Y Free (BOGO)</h4>
                    <p>Perfect for "Buy 2 Get 1 Free" deals.
                        <br />• <strong>Buy (Qty):</strong> How many you pay for (e.g., 2).
                        <br />• <strong>Get Free (Qty):</strong> How many extra you get (e.g., 1).
                        <br />The tool shows you the <strong>actual % discount</strong> you are getting.</p>
                </div>
                <div>
                    <h4 className="font-bold text-rose-500 mb-1">3. Fixed Amount Off</h4>
                    <p>Use this when you have a flat coupon like "₹500 Off".</p>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function DealTypeBtn({ id, label, icon, active, onClick }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap
                ${isActive
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                }`}
        >
            <span>{icon}</span> {label}
        </button>
    );
}

function InputSimple({ label, value, setValue, placeholder, type = 'number' }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-slate-800"
            />
        </div>
    );
}
