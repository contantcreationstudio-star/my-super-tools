'use client';

import { useState, useMemo } from 'react';
import AdUnit from '../../../components/AdUnit';

// --- Character Mappings ---

const STYLES = [
    {
        id: 'bold',
        name: 'Bold (Serif)',
        map: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
    },
    {
        id: 'bold_sans',
        name: 'Bold (Sans)',
        map: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
    },
    {
        id: 'script',
        name: 'Cursive (Script)',
        map: '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩0123456789'
    },
    {
        id: 'bubble',
        name: 'Bubble Circles',
        map: 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨'
    },
    {
        id: 'square',
        name: 'Square Box',
        map: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789'
    },
    {
        id: 'black_square',
        name: 'Filled Square',
        map: '🅰🅱🅲🅳🅴🅵🅶🅷🅸🉉🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🉉🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789'
    },
    {
        id: 'monospace',
        name: 'Monospace',
        map: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
    },
    {
        id: 'wide',
        name: 'Wide Text',
        map: 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９'
    },
];

const DECORATIONS = [
    { id: 'none', label: 'None', left: '', right: '' },
    { id: 'star', label: '★ Star', left: '★ ', right: ' ★' },
    { id: 'sparkle', label: '✨ Sparkle', left: '✨ ', right: ' ✨' },
    { id: 'fire', label: '🔥 Fire', left: '🔥 ', right: ' 🔥' },
    { id: 'wings', label: '꧁꧂ Wings', left: '꧁ ', right: ' ꧂' },
    { id: 'bracket', label: '【】', left: '【 ', right: ' 】' },
    { id: 'bolt', label: '⚡ Bolt', left: '⚡ ', right: ' ⚡' },
    { id: 'heart', label: '❤️ Love', left: '❤️ ', right: ' ❤️' },
    { id: 'arrow', label: '➳ Arrow', left: '➳ ', right: ' ➳' },
];

const NORMAL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Special Transformers
const TRANSFORMERS = {
    flip: (text) => {
        const map = {
            'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ı', 'j': 'ɾ',
            'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
            'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
            'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': 'Ɑ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ',
            'K': '⋊', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ò', 'R': 'ᴚ', 'S': 'S', 'T': '⊥',
            'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
            '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
            '.': '˙', ',': '\'', '?': '¿', '!': '¡', '"': ',,', '\'': ',', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾'
        };
        return text.split('').reverse().map(c => map[c] || c).join('');
    },
    strike: (text) => {
        return text.split('').map(c => c + '\u0336').join('');
    }
};

// Random Presets
const COOL_NAMES = [
    "Sniper", "Ghost", "Viper", "Shadow", "Wolf", "Dragon", "Phoenix",
    "Ninja", "King", "Queen", "Demon", "Angel", "Slayer", "Legend",
    "Cyber", "Toxic", "Venom", "Storm", "Frost", "Blaze",
    "꧁ ₦Ї₦ℑ₳ ꧂", "꧁༺ Shadow ༻꧂", "★ 𝔖𝔩𝔞𝔶𝔢𝔯 ★", "⚡ Ƶ𝔢𝔲𝔰 ⚡"
];

export default function StylishText() {
    const [input, setInput] = useState('Super App');
    const [activeDeco, setActiveDeco] = useState('none');
    const [copiedId, setCopiedId] = useState(null);

    // Custom Style State
    const [showCustom, setShowCustom] = useState(false);
    const [customMap, setCustomMap] = useState('');

    // Apply decoration helper
    const decorate = (text) => {
        const deco = DECORATIONS.find(d => d.id === activeDeco) || DECORATIONS[0];
        return deco.left + text + deco.right;
    };

    // Convert Helper
    const convert = (text, style) => {
        if (!text) return '';
        const normalMap = NORMAL;
        const targetArray = Array.from(style.map);

        return text.split('').map(char => {
            const index = normalMap.indexOf(char);
            if (index !== -1 && index < targetArray.length) {
                return targetArray[index];
            }
            return char;
        }).join('');
    };

    // Custom Convert Helper
    const convertCustom = (text) => {
        if (!text || customMap.length < 26) return text;
        const normalMap = NORMAL;
        // Use custom map characters. If custom map is shorter than Normal map, fallback or loop?
        // Let's assume user inputs a string of at least 26 chars for a-z.
        // We'll map a-z to the first 26 chars of customMap. 
        // For simplicity, let's just map lowercase a-z.
        const targetArray = Array.from(customMap);

        return text.split('').map(char => {
            const index = normalMap.indexOf(char.toLowerCase()); // Case insensitive map for custom
            if (index !== -1 && index < targetArray.length) {
                return targetArray[index];
            }
            return char;
        }).join('');
    };

    // Mix Style Logic (Memoized to prevent jitter on re-renders unless input changes)
    const mixText = useMemo(() => {
        if (!input) return '';
        const normalMap = NORMAL;
        const availableMaps = [STYLES[0].map, STYLES[1].map, STYLES[2].map, STYLES[6].map]; // Bold, Sans, Script, Mono

        return input.split('').map(char => {
            if (char === ' ') return ' ';
            const index = normalMap.indexOf(char);
            if (index !== -1) {
                // Randomly pick a style map
                const randomMapStr = availableMaps[Math.floor(Math.random() * availableMaps.length)];
                const randomMap = Array.from(randomMapStr);
                return randomMap[index] || char;
            }
            return char;
        }).join('');
    }, [input]);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generateRandom = () => {
        const randomName = COOL_NAMES[Math.floor(Math.random() * COOL_NAMES.length)];
        setInput(randomName);
    };

    // Render Result Card
    const RenderCard = ({ id, name, text }) => (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-fuchsia-200 hover:shadow-md transition-all group flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{name}</div>
                <div className="text-xl md:text-2xl text-slate-800 break-words font-medium">{text || 'Preview...'}</div>
            </div>
            <button
                onClick={() => copyToClipboard(text, id)}
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copiedId === id
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-fuchsia-100 hover:text-fuchsia-700'
                    }`}
            >
                {copiedId === id ? '✓ Copied' : 'Copy'}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-fuchsia-50 font-sans selection:bg-fuchsia-200 pb-20">

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-fuchsia-100 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🆎</span>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                Stylish <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Text</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowCustom(!showCustom)}
                            className="text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-3 py-1.5 rounded-lg border border-fuchsia-100 hover:bg-fuchsia-100 transition-colors"
                        >
                            {showCustom ? 'Hide Creator' : '+ Custom Style'}
                        </button>
                    </div>

                    {/* Custom Style Creator */}
                    {showCustom && (
                        <div className="mb-4 bg-fuchsia-50 p-4 rounded-xl border border-fuchsia-100 animate-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                Your Alphabet (Map a-z to...)
                            </label>
                            <input
                                value={customMap}
                                onChange={(e) => setCustomMap(e.target.value)}
                                placeholder="Paste 26 chars (e.g. αβc...)"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-fuchsia-500 outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Paste characters to map a, b, c... in order.</p>
                        </div>
                    )}

                    {/* Input */}
                    <div className="relative mb-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type text here..."
                            className="w-full bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-fuchsia-500 rounded-2xl p-4 text-lg font-bold text-slate-700 outline-none transition-all resize-none shadow-inner h-20 placeholder:text-slate-300 pr-20"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {input && (
                                <button
                                    onClick={() => setInput('')}
                                    className="text-slate-300 hover:text-slate-500 text-sm font-bold bg-white rounded-full w-8 h-8 flex items-center justify-center border border-slate-200 shadow-sm"
                                    title="Clear"
                                >
                                    ✕
                                </button>
                            )}
                            <button
                                onClick={generateRandom}
                                className="text-fuchsia-500 hover:text-fuchsia-600 text-lg font-bold bg-white rounded-full w-8 h-8 flex items-center justify-center border border-slate-200 shadow-sm transition-transform active:scale-95"
                                title="Random Name"
                            >
                                🪄
                            </button>
                        </div>
                    </div>

                    {/* Decorator Toolbar */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 mask-linear">
                        {DECORATIONS.map(d => (
                            <button
                                key={d.id}
                                onClick={() => setActiveDeco(d.id)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeDeco === d.id
                                        ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-md'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-fuchsia-300'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

                {/* Custom Card */}
                {customMap.length > 0 && (
                    <RenderCard id="custom" name="✨ Your Custom Style" text={decorate(convertCustom(input))} />
                )}

                {/* Mix Style (Special) */}
                <RenderCard id="mix" name="🎲 Mix / Chaos" text={decorate(mixText)} />

                {/* Regular Styles */}
                {STYLES.map(style => (
                    <RenderCard
                        key={style.id}
                        id={style.id}
                        name={style.name}
                        text={decorate(convert(input, style))}
                    />
                ))}

                {/* Transformers */}
                {['flip', 'strike'].map(type => {
                    const base = TRANSFORMERS[type](input);
                    const name = type === 'flip' ? 'Upside Down' : 'Strikethrough';
                    // Decorators might look weird on flip, but let's allow it for chaos
                    return <RenderCard key={type} id={type} name={name} text={decorate(base)} />;
                })}

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm mb-6">Works on Instagram, TikTok, Discord, and Twitter!</p>
                    <AdUnit />
                </div>

            </div>
        </div>
    );
}
