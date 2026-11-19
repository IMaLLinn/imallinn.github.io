import type { APIRoute, GetStaticPaths } from 'astro';
import { feedFor } from '../../../lib/feed';
import { filterValues, legacyTaxonomies, legacyTerms, legacyTermSlug, publishedPosts } from '../../../lib/posts';
import { site } from '../../../config/site';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await publishedPosts();
  return Object.entries(legacyTaxonomies).flatMap(([taxonomy, filter]) =>
    [...legacyTerms(posts, filter)].map(([term, title]) => ({
      params: { taxonomy, term },
      props: {
        title,
        posts: posts.filter((post) => filterValues(post, filter).some((value) => legacyTermSlug(value) === term)),
      },
    })),
  );
};

export const GET: APIRoute = ({ props }) => feedFor(props.posts, props.title + ' · ' + site.name);
