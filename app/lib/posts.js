import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'app/data');
const postsFilePath = path.join(dataDirectory, 'posts.json');

export async function getPosts() {
    try {
        const fileContents = await fs.promises.readFile(postsFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        return [];
    }
}

export async function getPostBySlug(slug) {
    const posts = await getPosts();
    return posts.find(post => post.slug === slug);
}

export async function savePost(newPost) {
    // Ensure data directory exists
    if (!fs.existsSync(dataDirectory)) {
        await fs.promises.mkdir(dataDirectory, { recursive: true });
    }

    const posts = await getPosts();
    const existingIndex = posts.findIndex(p => p.slug === newPost.slug);

    if (existingIndex > -1) {
        posts[existingIndex] = { ...posts[existingIndex], ...newPost };
    } else {
        posts.unshift({
            id: Date.now(),
            ...newPost,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
    }

    await fs.promises.writeFile(postsFilePath, JSON.stringify(posts, null, 4), 'utf8');
    return true;
}

export async function deletePost(slug) {
    const posts = await getPosts();
    const filteredPosts = posts.filter(p => p.slug !== slug);
    await fs.promises.writeFile(postsFilePath, JSON.stringify(filteredPosts, null, 4), 'utf8');
    return true;
}
