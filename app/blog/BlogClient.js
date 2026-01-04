'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';

export default function BlogClient({ posts }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50"></div>}>
            <BlogContent posts={posts} />
        </Suspense>
    );
}

function BlogContent({ posts }) {
    const [filter, setFilter] = useState('All');
    const categories = ['All', ...new Set(posts.map(p => p.category))];

    const filteredPosts = filter === 'All'
        ? posts
        : posts.filter(p => p.category === filter);

    return (
        <div className="bg-slate-50 min-h-screen relative font-sans selection:bg-indigo-100 selection:text-indigo-700">

            {/* --- BACKGROUND MESH --- */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="fixed right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500 opacity-5 blur-[120px]"></div>
            <div className="fixed left-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500 opacity-5 blur-[120px]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

                {/* --- HEADER --- */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                        Insights & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Updates
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        News, tutorials, and deep dives into the tools that power your workflow.
                    </p>
                </div>

                {/* --- FILTERS --- */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${filter === cat
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* --- GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <article key={post.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                            {/* Hover Gradient Border */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-50 rounded-2xl pointer-events-none transition-colors"></div>

                            {/* Image Placeholder */}
                            <div className="h-48 bg-slate-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                                {post.image}
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    <span className="text-indigo-600">{post.category}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs font-semibold text-slate-400">
                                        {post.readTime}
                                    </span>
                                    <span className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read More
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Full Link Overlay */}
                            <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10"></Link>
                        </article>
                    ))}
                </div>

                {/* --- EMPTY STATE --- */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">📭</div>
                        <h3 className="text-lg font-bold text-slate-900">No posts found</h3>
                        <p className="text-slate-500">Try selecting a different category.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
