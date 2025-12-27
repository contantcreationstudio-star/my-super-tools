'use client'; // 👈 Yeh jaruri hai interactivity ke liye

import { useState, useEffect } from 'react';
import { tools } from '../config/tools';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  // --- STATE MANAGEMENT (Dimag) ---
  const [activeTab, setActiveTab] = useState('All');

  // URL Search Logic
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(rawQuery);

  // Sync state when URL parameter changes (e.g. from Navbar)
  useEffect(() => {
    setSearchQuery(rawQuery);
  }, [rawQuery]);

  // Update URL when typing in the Big Search Bar
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val) {
      router.push(`/?q=${encodeURIComponent(val)}`);
    } else {
      router.push('/');
    }
  };

  // --- FILTER LOGIC (Jaadu) ---
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeTab === 'All' || tool.category === activeTab;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen relative font-sans selection:bg-indigo-100 selection:text-indigo-700">

      {/* --- BACKGROUND MESH --- */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-10 blur-[120px]"></div>

      <div className="relative z-10">

        {/* --- HERO SECTION --- */}
        <section className="pt-6 pb-20 text-center px-6">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-8 uppercase tracking-wider animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            v2.0 System Online
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Tools for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">
              Next Gen Creators.
            </span>
          </h1>

          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed">
            Crafted for speed. No clutter, no ads, just pure utility.
            Select a category below to get started.
          </p>

          {/* --- INTERACTIVE SEARCH & FILTER --- */}
          <div className="max-w-2xl mx-auto space-y-8">

            {/* 1. Real-time Search */}
            <div className="relative group mx-auto max-w-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
              <div className="relative bg-white rounded-full flex items-center shadow-lg ring-1 ring-slate-900/5">
                <span className="pl-5 text-xl text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Type to search (e.g. Age)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full p-4 bg-transparent outline-none text-slate-700 font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {/* 2. Live Tab Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'Personal', 'Math', 'Design'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${activeTab === tab
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                >
                  {tab === 'All' ? '🔥 All Tools' : tab}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* --- TOOLS GRID --- */}
        <section className="max-w-7xl mx-auto px-6 pb-32">

          {/* Result Counter */}
          <div className="mb-8 text-slate-400 font-medium text-sm ml-2">
            Showing {filteredTools.length} tools
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <Link href={tool.link} key={tool.id} className="group relative block">

                  {/* Spotlight Effect Border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>

                  <div className="relative h-full bg-white p-8 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all flex flex-col items-start overflow-hidden">

                    {/* Background Decoration Blob */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>

                    {/* Icon */}
                    <div className="relative w-14 h-14 bg-slate-50 text-3xl rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:rotate-6 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all duration-300">
                      {tool.icon}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 z-10">
                      {tool.name}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed mb-6 z-10">
                      {tool.description}
                    </p>

                    <div className="mt-auto flex items-center text-sm font-bold text-indigo-600 z-10">
                      Launch Tool <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Empty State
              <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-4xl mb-4">👻</div>
                <h3 className="text-lg font-bold text-slate-900">No tools found</h3>
                <p className="text-slate-500">Try searching for something else.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    router.push('/');
                    setActiveTab('All');
                  }}
                  className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </section>
      </div>
    </div>
  )
}