import type { APIRoute, GetStaticPaths } from 'astro';
import { publishedPosts, slugOf } from '../../../lib/posts';

export const getStaticPaths: GetStaticPaths = async () =>
  (await publishedPosts()).map((post) => ({ params: { slug: slugOf(post) }, props: { post } }));

export const GET: APIRoute = ({ props: { post } }) =>
  new Response(`# ${post.data.title}\n\n${post.body ?? ''}`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
