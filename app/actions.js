'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { savePost } from './lib/posts';

export async function loginAction(formData) {
    const pin = formData.get('pin');

    // Simple PIN check
    if (pin === '1234') {
        const cookieStore = await cookies();
        cookieStore.set('admin_token', 'authenticated', {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        redirect('/admin/dashboard');
    } else {
        return { error: 'Invalid PIN' };
    }
}



export async function deletePostAction(formData) {
    const cookieStore = await cookies();
    if (!cookieStore.has('admin_token')) {
        throw new Error('Unauthorized');
    }

    const slug = formData.get('slug');
    if (slug) {
        const { deletePost } = await import('./lib/posts');
        await deletePost(slug);
    }

    redirect('/admin/dashboard');
}

export async function savePostAction(formData) {
    const cookieStore = await cookies();
    if (!cookieStore.has('admin_token')) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title');
    const slug = formData.get('slug');
    const content = formData.get('content');
    const excerpt = formData.get('excerpt');
    const category = formData.get('category');
    const imageUrl = formData.get('image') || '📝'; // Default emoji if empty

    const toolName = formData.get('toolName');
    const toolLink = formData.get('toolLink');
    const toolIcon = formData.get('toolIcon');

    let relatedTool = null;
    if (toolName && toolLink) {
        relatedTool = {
            name: toolName,
            link: toolLink,
            icon: toolIcon || '🔧'
        };
    }

    const newPost = {
        title,
        slug,
        content,
        excerpt,
        category,
        image: imageUrl,
        readTime: '5 min read', // Hardcoded for simplicity or calc based on word count
        relatedTool
    };

    await savePost(newPost);
    redirect(`/blog/${slug}`);
}
