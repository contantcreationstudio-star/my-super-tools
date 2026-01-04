import { LayoutTemplate, CreditCard, Box, Type, MousePointer2 } from 'lucide-react';
import { Star, Zap, Mail, Shield, ArrowRight } from 'lucide-react';
export const COMPONENT_REGISTRY = [
    {
        id: 'hero_3d_glow',
        label: '✨ 3D Glowing Hero',
        icon: LayoutTemplate,
        type: 'hero',
        // Advanced: Animated Background + Glassmorphism
        content: `
        <div class="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-slate-950">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            
            <div class="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
            <div class="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
            
            <div class="relative z-10 text-center">
                <h1 class="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 tracking-tight">
                    Future UI
                </h1>
                <p class="mt-4 text-neutral-400 max-w-lg mx-auto text-lg">
                    Experience the next generation of web design.
                </p>
                <button class="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)]">
                    Get Started
                </button>
            </div>
        </div>
        `
    },
    {
        id: 'card_glass_tilt',
        label: '🧊 3D Glass Card',
        icon: CreditCard,
        type: 'card',
        // Advanced: Tilt Effect & Border Gradient
        content: `
        <div class="group relative w-full max-w-sm mx-auto p-0.5 rounded-2xl bg-gradient-to-br from-white/20 to-white/0 hover:from-purple-500 hover:to-cyan-500 transition-all duration-500 hover:scale-[1.02]">
            <div class="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">Holographic Design</h3>
                <p class="text-slate-400">Hover over this card to see the border glow and scale effect. Pure CSS magic.</p>
            </div>
        </div>
        `
    },
    {
        id: 'grid_bento_animated',
        label: '🍱 Moving Bento Grid',
        icon: Box,
        type: 'grid',
        // Advanced: Grid Layout with Hover Effects
        content: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 max-w-6xl mx-auto">
            <div class="md:col-span-2 row-span-2 relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-600 transition group">
                <div class="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <h3 class="text-3xl font-bold text-white relative z-10">Master Control</h3>
                <p class="text-neutral-400 mt-2 relative z-10">A large feature block that dominates the grid.</p>
            </div>
            <div class="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-600 transition group">
                 <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/40 transition"></div>
                <h3 class="text-xl font-bold text-white">Analytics</h3>
            </div>
            <div class="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-600 transition group">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl group-hover:bg-pink-500/40 transition"></div>
                <h3 class="text-xl font-bold text-white">Security</h3>
            </div>
        </div>
        `
    },
    {
        id: 'btn_neon_cyber',
        label: '🕹️ Cyber Button',
        icon: MousePointer2,
        type: 'button',
        // Advanced: Neon Glow & Glitch Text
        content: `
        <div class="flex justify-center py-4">
            <button class="relative px-8 py-4 font-bold text-white uppercase tracking-widest bg-transparent border border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 group overflow-hidden">
                <span class="relative z-10 group-hover:text-cyan-400 transition">Initialize System</span>
                <div class="absolute inset-0 w-full h-full bg-cyan-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 skew-x-12"></div>
                <div class="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
            </button>
        </div>
        `
    }
    ,{
        id: 'pricing_neon',
        label: '💎 Neon Pricing',
        icon: Star,
        type: 'section',
        // Advanced: Gradient Border + Glowing Hover Effect
        content: `
        <div class="p-1 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 max-w-sm mx-auto hover:scale-105 transition-transform duration-300">
            <div class="bg-slate-950 rounded-[22px] p-8 relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 group-hover:h-[2px] transition-all"></div>
                <h3 class="text-slate-400 font-medium uppercase tracking-widest text-sm">Pro Plan</h3>
                <div class="mt-4 flex items-baseline gap-1">
                    <span class="text-4xl font-bold text-white">$49</span>
                    <span class="text-slate-500">/mo</span>
                </div>
                <ul class="mt-8 space-y-4">
                    <li class="flex items-center text-slate-300"><span class="w-2 h-2 bg-cyan-500 rounded-full mr-3 shadow-[0_0_10px_#06b6d4]"></span>unlimited Access</li>
                    <li class="flex items-center text-slate-300"><span class="w-2 h-2 bg-cyan-500 rounded-full mr-3 shadow-[0_0_10px_#06b6d4]"></span>AI Automation</li>
                    <li class="flex items-center text-slate-300"><span class="w-2 h-2 bg-cyan-500 rounded-full mr-3 shadow-[0_0_10px_#06b6d4]"></span>24/7 Priority Support</li>
                </ul>
                <button class="mt-8 w-full py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                    Choose Plan
                </button>
            </div>
        </div>
        `
    },
    {
        id: 'testimonial_glass',
        label: '💬 Glass Review',
        icon: Star,
        type: 'card',
        // Advanced: Backdrop Blur + Floating Avatar
        content: `
        <div class="relative group max-w-md mx-auto">
            <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div class="relative px-7 py-6 bg-slate-900 ring-1 ring-gray-900/5 rounded-xl leading-none flex items-top justify-start space-x-6">
                <div class="space-y-2">
                    <p class="text-slate-300 italic">"This tool completely changed how we build websites. The drag and drop feels like magic!"</p>
                    <div class="flex items-center gap-4 pt-4">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px]">
                            <div class="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white">JD</div>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">John Doe</h4>
                            <p class="text-slate-500 text-xs">CEO, TechStart</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    },
    {
        id: 'feature_list_animated',
        label: '⚡ Speed Features',
        icon: Zap,
        type: 'section',
        // Advanced: Hover slide effects
        content: `
        <div class="w-full max-w-2xl mx-auto space-y-4">
            <div class="group flex items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-purple-500/50 transition-all cursor-default">
                <div class="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div class="ml-4 flex-1">
                    <h3 class="text-white font-semibold">Lightning Fast</h3>
                    <p class="text-slate-400 text-sm group-hover:text-slate-300">Zero loading times with edge computing.</p>
                </div>
                <div class="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-purple-400">
                    →
                </div>
            </div>
            <div class="group flex items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-blue-500/50 transition-all cursor-default">
                <div class="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div class="ml-4 flex-1">
                    <h3 class="text-white font-semibold">Secure by Design</h3>
                    <p class="text-slate-400 text-sm group-hover:text-slate-300">Enterprise grade encryption built-in.</p>
                </div>
                <div class="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-blue-400">
                    →
                </div>
            </div>
        </div>
        `
    },
    {
        id: 'newsletter_cyber',
        label: '📧 Cyber Input',
        icon: Mail,
        type: 'form',
        // Advanced: Focus within effects
        content: `
        <div class="w-full max-w-xl mx-auto text-center py-10">
            <h3 class="text-2xl font-bold text-white mb-2">Join the Resistance</h3>
            <p class="text-slate-400 mb-6">Get the latest updates directly to your neural link.</p>
            <div class="relative flex items-center max-w-md mx-auto">
                <input type="email" placeholder="Enter your email..." class="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-full focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner placeholder:text-slate-600" />
                <button class="absolute right-2 bg-green-600 hover:bg-green-500 text-black font-bold px-6 py-2.5 rounded-full transition-all hover:shadow-[0_0_15px_#22c55e]">
                    Subscribe
                </button>
            </div>
        </div>
        `
    },
    {
        id: 'footer_mega',
        label: '🌊 Mega Footer',
        icon: Shield,
        type: 'footer',
        // Advanced: Multi-column clean layout
        content: `
        <footer class="w-full bg-slate-950 border-t border-slate-900 pt-16 pb-8 px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div class="col-span-2 md:col-span-1">
                    <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">Brand.</h2>
                    <p class="text-slate-500 text-sm">Crafting digital experiences for the future generation.</p>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-4">Product</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li class="hover:text-blue-400 cursor-pointer transition">Features</li>
                        <li class="hover:text-blue-400 cursor-pointer transition">Pricing</li>
                        <li class="hover:text-blue-400 cursor-pointer transition">Integrations</li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-4">Company</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li class="hover:text-blue-400 cursor-pointer transition">About</li>
                        <li class="hover:text-blue-400 cursor-pointer transition">Careers</li>
                        <li class="hover:text-blue-400 cursor-pointer transition">Blog</li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-4">Legal</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li class="hover:text-blue-400 cursor-pointer transition">Privacy</li>
                        <li class="hover:text-blue-400 cursor-pointer transition">Terms</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                <p>&copy; 2025 Brand Inc. All rights reserved.</p>
                <div class="flex gap-4">
                    <span>Twitter</span>
                    <span>GitHub</span>
                    <span>Discord</span>
                </div>
            </div>
        </footer>
        `
    }
];