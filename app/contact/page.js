'use client';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white pt-24 px-6 pb-20">
            <div className="max-w-3xl mx-auto text-center">

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Get in Touch
                </h1>

                <p className="text-lg text-slate-600 mb-12 max-w-xl mx-auto">
                    Have a suggestion for a new tool? Found a bug? Or just want to say hi?
                    We'd love to hear from you.
                </p>

                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 max-w-lg mx-auto">
                    <div className="text-5xl mb-6">📬</div>
                    <p className="text-slate-900 font-bold text-xl mb-2">Email Us</p>
                    <a href="mailto:hello@supertools.com" className="text-indigo-600 font-medium hover:underline text-lg">
                        hello@supertools.com
                    </a>

                    <div className="my-8 h-px bg-slate-200"></div>

                    <p className="text-slate-500 text-sm">
                        We usually respond within 24 hours. <br />
                        (Unless we're busy building new tools!)
                    </p>
                </div>

            </div>
        </div>
    );
}
