
import { tools } from './config/tools';
import { getPosts } from './lib/posts';

export default async function sitemap() {
    const baseUrl = 'https://supertools.app'; // Replace with actual domain

    // 1. Static Pages
    const staticPages = [
        '',
        '/blog',
        '/about',
        '/contact',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
    }));

    // 2. Tools Pages
    const toolPages = tools.map((tool) => ({
        url: `${baseUrl}${tool.link}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // 3. Blog Posts
    const posts = await getPosts();
    const blogPages = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(), // Ideally post.date if parsed correctly
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticPages, ...toolPages, ...blogPages];
}
