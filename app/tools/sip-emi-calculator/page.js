'use client';

import { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import AdUnit from '../../../components/AdUnit';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SipEmiCalculator() {
    const [activeTab, setActiveTab] = useState('sip');

    // --- SIP State ---
    const [monthlyInvest, setMonthlyInvest] = useState(10000);
    const [returnRate, setReturnRate] = useState(12);
    const [sipYears, setSipYears] = useState(10);

    // --- EMI State ---
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(9);
    const [loanYears, setLoanYears] = useState(20);

    // --- SIP Logic ---
    const sipData = useMemo(() => {
        const months = sipYears * 12;
        const monthlyRate = returnRate / 12 / 100;
        const invested = monthlyInvest * months;
        const totalValue = monthlyInvest * (Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate) / monthlyRate;
        const estReturns = totalValue - invested;

        return {
            invested: Math.round(invested),
            estReturns: Math.round(estReturns),
            totalValue: Math.round(totalValue)
        };
    }, [monthlyInvest, returnRate, sipYears]);

    // --- EMI Logic ---
    const emiData = useMemo(() => {
        const monthlyRate = interestRate / 12 / 100;
        const months = loanYears * 12;
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayable = emi * months;
        const totalInterest = totalPayable - loanAmount;

        return {
            emi: Math.round(emi),
            principal: Math.round(loanAmount),
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable)
        };
    }, [loanAmount, interestRate, loanYears]);

    // --- Chart Data ---
    const sipChartData = {
        labels: ['Invested Amount', 'Est. Returns'],
        datasets: [{
            data: [sipData.invested, sipData.estReturns],
            backgroundColor: ['#e2e8f0', '#10b981'], // Slate-200, Emerald-500
            borderWidth: 0,
        }]
    };

    const emiChartData = {
        labels: ['Principal Amount', 'Total Interest'],
        datasets: [{
            data: [emiData.principal, emiData.totalInterest],
            backgroundColor: ['#10b981', '#ef4444'], // Emerald-500, Red-500
            borderWidth: 0,
        }]
    };

    const formatRupee = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

    return (
        <div className="min-h-screen bg-emerald-50 font-sans selection:bg-emerald-500 selection:text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Finance <span className="text-emerald-700 bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Calculator</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Plan your wealth with our SIP Calculator or estimate loan repayments with our EMI tool.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 overflow-hidden border border-emerald-100">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('sip')}
                            className={`flex-1 py-6 text-center text-lg font-bold transition-all ${activeTab === 'sip'
                                    ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-500'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            📈 SIP Calculator
                        </button>
                        <button
                            onClick={() => setActiveTab('emi')}
                            className={`flex-1 py-6 text-center text-lg font-bold transition-all ${activeTab === 'emi'
                                    ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-500'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            🏠 EMI Calculator
                        </button>
                    </div>

                    <div className="p-8 lg:p-12">
                        {activeTab === 'sip' ? (
                            // --- SIP VIEW ---
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Inputs */}
                                <div className="space-y-8">
                                    <InputRange
                                        label="Monthly Investment"
                                        value={monthlyInvest}
                                        setValue={setMonthlyInvest}
                                        min={500} max={100000} step={500}
                                        prefix="₹"
                                    />
                                    <InputRange
                                        label="Expected Return Rate (p.a)"
                                        value={returnRate}
                                        setValue={setReturnRate}
                                        min={1} max={30} step={0.5}
                                        suffix="%"
                                    />
                                    <InputRange
                                        label="Time Period"
                                        value={sipYears}
                                        setValue={setSipYears}
                                        min={1} max={30} step={1}
                                        suffix=" Yr"
                                    />
                                </div>

                                {/* Results */}
                                <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="w-64 h-64">
                                            <Pie data={sipChartData} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <ResultRow label="Invested Amount" value={sipData.invested} color="text-slate-600" />
                                        <ResultRow label="Est. Returns" value={sipData.estReturns} color="text-emerald-600" bold />
                                        <div className="pt-4 border-t border-emerald-200">
                                            <div className="flex justify-between items-end">
                                                <span className="text-slate-500 font-medium">Total Value</span>
                                                <span className="text-3xl font-black text-slate-800">{formatRupee(sipData.totalValue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // --- EMI VIEW ---
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Inputs */}
                                <div className="space-y-8">
                                    <InputRange
                                        label="Loan Amount"
                                        value={loanAmount}
                                        setValue={setLoanAmount}
                                        min={10000} max={10000000} step={10000}
                                        prefix="₹"
                                    />
                                    <InputRange
                                        label="Interest Rate (p.a)"
                                        value={interestRate}
                                        setValue={setInterestRate}
                                        min={1} max={20} step={0.1}
                                        suffix="%"
                                    />
                                    <InputRange
                                        label="Loan Tenure"
                                        value={loanYears}
                                        setValue={setLoanYears}
                                        min={1} max={30} step={1}
                                        suffix=" Yr"
                                    />
                                </div>

                                {/* Results */}
                                <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="w-64 h-64">
                                            <Pie data={emiChartData} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <ResultRow label="Principal Amount" value={emiData.principal} color="text-emerald-600" />
                                        <ResultRow label="Total Interest" value={emiData.totalInterest} color="text-red-500" />
                                        <div className="pt-4 border-t border-emerald-200">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-slate-500 font-medium">Total Payable</span>
                                                <span className="text-xl font-bold text-slate-800">{formatRupee(emiData.totalPayable)}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-emerald-600 font-bold">Monthly EMI</span>
                                                <span className="text-4xl font-black text-emerald-600">{formatRupee(emiData.emi)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12">
                    <AdUnit />
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function InputRange({ label, value, setValue, min, max, step, prefix = '', suffix = '' }) {
    return (
        <div>
            <div className="flex justify-between mb-4">
                <label className="font-bold text-slate-700">{label}</label>
                <div className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm">
                    {prefix}{value.toLocaleString('en-IN')}{suffix}
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
    );
}

function ResultRow({ label, value, color, bold }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className={`text-lg ${bold ? 'font-bold' : 'font-medium'} ${color}`}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
            </span>
        </div>
    );
}
