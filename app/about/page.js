'use client';

import { Suspense } from 'react';

export default function AboutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white pt-24 px-6 flex justify-center text-slate-500">Loading...</div>}>
            <AboutContent />
        </Suspense>
    );
}

function AboutContent() {
    return (
        <div className="min-h-screen bg-white pt-24 px-6 pb-20">
            <div className="max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-8">
                    ⚡
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    About SuperTools
                </h1>

                <div className="prose prose-lg prose-slate text-slate-600 leading-relaxed space-y-6">
                    <p className="text-xl font-medium text-slate-800">
                        We believe that powerful tools should be fast, free, and accessible to everyone.
                    </p>

                    <p>
                        Started in 2025, SuperTools was built with a single mission: to cut through the clutter of the internet.
                        No ads, no logins, no slow loading times. Just the utility you need, the moment you need it.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-10">Our Philosophy</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Speed First:</strong> If it's not instant, it's too slow.</li>
                        <li><strong>Privacy Always:</strong> Your data stays on your device. We don't store inputs.</li>
                        <li><strong>Design Matters:</strong> Tools should be beautiful, not just functional.</li>
                    </ul>

                    <p>
                        Whether you're calculating your age, checking compatibility, or converting files,
                        SuperTools is your reliable digital Swiss Army knife.
                    </p>
                </div>
            </div>
        </div>
    );
}
