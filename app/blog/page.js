
import { getPosts } from '../lib/posts';
import BlogClient from './BlogClient';

export default async function BlogPage() {
    const posts = await getPosts();
    return <BlogClient posts={posts} />;
}
