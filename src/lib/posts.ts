import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../config/site';

export type Post = CollectionEntry<'posts'>;
export const titleOf = (post: Post) => post.data.displayTitle ?? post.data.title;
export const slugOf = (post: Post) => post.data.slug ?? post.id;
export const postHref = (post: Post) => '/' + ['posts', ...slugOf(post).split('/').map(encodeURIComponent), ''].join('/');
export const postTopic = (post: Post) => post.data.series || post.data.categories[0];
export const filters = ['series', 'category', 'tag'] as const;
export type Filter = typeof filters[number];

export function filterHref(filter: Filter, value: string) {
  return '/posts/?' + new URLSearchParams({ [filter]: value });
}

export function filterValues(post: Post, filter: Filter) {
  if (filter === 'category') return post.data.categories;
  if (filter === 'tag') return post.data.tags;
  const topic = postTopic(post);
  return topic ? [topic] : [];
}

const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: site.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
});
export const dateOf = (post: Post) => dateFormat.format(post.data.pubDate);

export async function publishedPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => +b.data.pubDate - +a.data.pubDate || slugOf(a).localeCompare(slugOf(b)));
}

export function featuredPost(posts: Post[], slot: NonNullable<Post['data']['featured']>) {
  return posts.filter(({ data }) => data.featured === slot).sort((a, b) =>
    (a.data.featuredOrder ?? Infinity) - (b.data.featuredOrder ?? Infinity) || +b.data.pubDate - +a.data.pubDate,
  )[0];
}

export function topicsOf(posts: Post[]) {
  const topics = new Map<string, number>();
  for (const post of posts) {
    const topic = postTopic(post);
    if (topic) topics.set(topic, (topics.get(topic) ?? 0) + 1);
  }
  return [...topics].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], site.locale));
}

export function searchText(body = '') {
  return body.replace(/^```[^\n]*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingMinutes(post: Post) {
  const text = searchText(post.body?.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, ''));
  const han = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.match(/[\p{Script=Latin}\d]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(han / 350 + words / 220));
}

export const legacyTaxonomies = {
  categories: 'category',
  tags: 'tag',
  collections: 'series',
} as const;

export const legacyTermSlug = (term: string) =>
  term.trim().normalize('NFC').toLowerCase().replace(/[\s/\\]+/g, '-').replace(/[^\p{L}\p{N}._-]/gu, '');

export function legacyTerms(posts: Post[], filter: Filter) {
  const terms = new Map<string, string>();
  for (const post of posts) {
    const values = filter === 'series' ? (post.data.series ? [post.data.series] : []) : filterValues(post, filter);
    for (const value of values) {
      const slug = legacyTermSlug(value);
      if (/^[\p{L}\p{N}]/u.test(slug)) terms.set(slug, value);
    }
  }
  return terms;
}
