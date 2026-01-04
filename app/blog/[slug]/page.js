
import { getPostBySlug } from '../../lib/posts';
import Link from 'next/link';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found - SuperTools',
            description: 'The requested blog post could not be found.'
        };
    }

    return {
        title: `${post.title} - SuperTools Insights`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: ['SuperTools Team'],
            images: [
                {
                    url: '/og-image.png', // Placeholder, ideally specific to post
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        }
    };
}

export default async function BlogPost({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="text-6xl mb-4">🤔</div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Post not found</h1>
                <p className="text-slate-500 mb-6">The article you are looking for doesn't exist.</p>
                <Link href="/blog" className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen relative font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
            {/* --- BACKGROUND MESH --- */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12">

                {/* Navigation */}
                <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Blog
                </Link>

                {/* Header */}
                <header className="text-center mb-10">
                    <div className="inline-block p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-6xl mb-6">
                        {post.image}
                    </div>

                    <div className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                        <span className="text-indigo-600">{post.category}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                </header>

                {/* Content */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <div
                        className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 hover:prose-a:text-indigo-700"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Related Tool CTA */}
                    {post.relatedTool && (
                        <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm shrink-0">
                                {post.relatedTool.icon}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Try the tool mentioned!</h3>
                                <p className="text-slate-600 text-sm">Experience {post.relatedTool.name} directly in your browser.</p>
                            </div>
                            <Link
                                href={post.relatedTool.link}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
                            >
                                Open Tool 🚀
                            </Link>
                        </div>
                    )}
                </div>

            </article>
        </div>
    );
}
