import type { APIRoute } from 'astro';
import { feedFor } from '../lib/feed';
import { publishedPosts } from '../lib/posts';

export const GET: APIRoute = async () => feedFor(await publishedPosts());
