import type { APIRoute } from 'astro';
import { postHref, postTopic, publishedPosts, searchText, titleOf } from '../lib/posts';
import type { SearchPost } from '../lib/search';

export const GET: APIRoute = async () => {
  const entries: SearchPost[] = (await publishedPosts()).map((post) => ({
    title: post.data.title,
    displayTitle: titleOf(post),
    description: post.data.description,
    tags: post.data.tags,
    categories: post.data.categories,
    series: postTopic(post) ?? '',
    url: postHref(post),
    body: searchText(post.body),
  }));
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
