'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { tools } from '../config/tools';

export default function Navbar() {
    return (
        <Suspense fallback={<div className="h-16 bg-white/70 backdrop-blur-xl border-b border-indigo-50/50"></div>}>
            <NavbarContent />
        </Suspense>
    );
}

function NavbarContent() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // Sync state with URL param only on initial load or if empty
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) setSearchQuery(q);
    }, [searchParams]);

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (term) => {
        setSearchQuery(term);
        if (term) {
            const matches = tools.filter(tool =>
                tool.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredResults(matches);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setShowDropdown(false);
            if (searchQuery) {
                router.push(`/?q=${encodeURIComponent(searchQuery)}`);
                setIsSearchOpen(false); // Close mobile search on enter
            } else {
                router.push('/');
            }
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isSearchOpen) setIsSearchOpen(false);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isMenuOpen) setIsMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-b border-indigo-50/50">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                        ⚡
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">SuperTools</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Link href="/" className="px-4 py-2 rounded-full hover:bg-slate-100/80 hover:text-indigo-600 transition-all">Home</Link>

                    <Link href="/blog" className="px-4 py-2 rounded-full hover:bg-slate-100/80 hover:text-indigo-600 transition-all">Blog</Link>
                    <Link href="/about" className="px-4 py-2 rounded-full hover:bg-slate-100/80 hover:text-indigo-600 transition-all">About</Link>
                    <Link href="/contact" className="px-4 py-2 rounded-full hover:bg-slate-100/80 hover:text-indigo-600 transition-all">Contact</Link>
                </div>

                {/* Right Buttons (Desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Functional Search Bar with Dropdown */}
                    <div className="relative group" ref={searchRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => searchQuery && setShowDropdown(true)}
                            className="pl-9 pr-4 py-1.5 bg-slate-100/50 focus:bg-white text-sm text-slate-800 rounded-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none w-48 focus:w-64 transition-all duration-300 placeholder-slate-400"
                        />

                        {/* Search Dropdown Results */}
                        {showDropdown && (
                            <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-down origin-top-left">
                                {filteredResults.length > 0 ? (
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Results</div>
                                        {filteredResults.map(tool => (
                                            <Link
                                                key={tool.id}
                                                href={tool.link}
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    setSearchQuery('');
                                                }}
                                                className="block px-4 py-2.5 hover:bg-indigo-50 transition-colors flex items-center gap-3"
                                            >
                                                <span className="text-xl">{tool.icon}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{tool.name}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{tool.category}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        No tools found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Icons Container */}
                <div className="flex md:hidden items-center gap-1">
                    {/* Mobile Search Button */}
                    <button
                        className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                        onClick={toggleSearch}
                        aria-label="Toggle Search"
                    >
                        {isSearchOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        )}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Search Bar (Separate Dropdown) */}
            {isSearchOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-indigo-50 shadow-lg p-4 animate-fade-in-down">
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                        <div className="absolute right-3 top-3 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Dropdown (Links Only) */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-indigo-50 shadow-xl px-6 py-6 flex flex-col gap-2 animate-fade-in-down">
                    <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-xl">🏠</span> Home
                    </Link>
                    <Link href="/blog" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-xl">📝</span> Blog
                    </Link>
                    <Link href="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-xl">👋</span> About
                    </Link>
                    <Link href="/contact" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-xl">📬</span> Contact
                    </Link>
                </div>
            )}
        </header>
    );
}
