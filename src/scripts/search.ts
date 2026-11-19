import type { SearchPost } from '../lib/search';

let pending: Promise<SearchPost[]> | undefined;

export function loadSearchPosts() {
  pending ??= fetch('/search.json')
    .then(async (response) => {
      if (!response.ok) throw new Error('Search index unavailable');
      return await response.json() as SearchPost[];
    })
    .catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
  return pending;
}
