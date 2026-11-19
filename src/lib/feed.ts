import rss from '@astrojs/rss';
import { site } from '../config/site';
import { postHref, type Post } from './posts';

export function feedFor(posts: Post[], title: string = site.name) {
  return rss({
    title,
    description: site.description,
    site: site.url,
    customData: '<language>zh-CN</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postHref(post),
      categories: post.data.categories,
    })),
  });
}
