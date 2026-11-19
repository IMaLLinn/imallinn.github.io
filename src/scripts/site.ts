import { navigate } from 'astro:transitions/client';
import Fuse from 'fuse.js';
import type { SearchPost } from '../lib/search';
import { loadSearchPosts } from './search';

const root = document.documentElement;
const modifier = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl';
const clockFormat = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
let dark = root.classList.contains('dark');
let clockTimer: number | undefined;
let toastTimer: number | undefined;
let fuse: Fuse<SearchPost> | undefined;

function toast(message: string) {
  const element = document.querySelector<HTMLElement>('[data-toast]');
  if (!element) return;
  window.clearTimeout(toastTimer);
  element.textContent = message;
  element.classList.add('visible');
  toastTimer = window.setTimeout(() => element.classList.remove('visible'), 2500);
}

function toggleTheme() {
  dark = !dark;
  document.documentElement.classList.toggle('dark', dark);
  try { localStorage.setItem('jude-theme', dark ? 'dark' : 'light'); } catch {}
}

document.addEventListener('astro:before-swap', (event) => {
  event.newDocument.documentElement.classList.toggle('dark', dark);
});
document.addEventListener('astro:after-swap', () => {
  document.documentElement.classList.toggle('dark', dark);
});

function highlighted(text: string, query: string) {
  const fragment = document.createDocumentFragment();
  let start = 0;
  const lower = text.toLowerCase();
  for (let match = lower.indexOf(query); match !== -1; match = lower.indexOf(query, start)) {
    fragment.append(text.slice(start, match));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(match, match + query.length);
    fragment.append(mark);
    start = match + query.length;
  }
  fragment.append(text.slice(start));
  return fragment;
}

function resultRow(post: SearchPost, query: string) {
  const link = document.createElement('a');
  link.href = post.url;
  link.className = 'command-item search-result';
  link.dataset.commandItem = '';
  const title = document.createElement('strong');
  title.append(highlighted(post.displayTitle, query));
  const matchAt = post.body.toLowerCase().indexOf(query);
  const snippet = matchAt >= 0 && ![post.title, post.displayTitle, post.description].some((text) => text.toLowerCase().includes(query));
  const source = snippet ? post.body.slice(Math.max(0, matchAt - 18), matchAt + query.length + 40) : post.description;
  const detail = document.createElement('small');
  const metadata = [post.series, ...post.tags].filter(Boolean).join(' · ');
  detail.append(highlighted(source + (snippet ? '…' : '') + (metadata ? ' · ' + metadata : ''), query));
  link.append(title, detail);
  return link;
}

function setupCommand(dialog: HTMLDialogElement, signal: AbortSignal) {
  const input = dialog.querySelector('input')!;
  const results = dialog.querySelector<HTMLElement>('[data-search-results]')!;
  const group = dialog.querySelector<HTMLElement>('[data-search-group]')!;
  const status = dialog.querySelector<HTMLElement>('[data-search-status]')!;
  const actions = dialog.querySelector<HTMLElement>('[data-command-actions]')!;
  const scrollArea = dialog.querySelector<HTMLElement>('.command-scroll')!;
  const staticItems = [...actions.querySelectorAll<HTMLElement>('[data-command-item]')];
  let active = 0;
  let searchVersion = 0;
  let opener: HTMLElement | null;

  function items() {
    return [...dialog.querySelectorAll<HTMLElement>('[data-command-item]')].filter((item) => !item.closest('[hidden]'));
  }

  function select(index: number, scroll = false) {
    const options = items();
    active = options.length ? (index + options.length) % options.length : 0;
    options.forEach((item, position) => item.classList.toggle('selected', position === active));
    if (scroll) options[active]?.scrollIntoView({ block: 'nearest' });
  }

  async function search() {
    const version = ++searchVersion;
    const query = input.value.trim().toLowerCase();
    group.hidden = !query;
    results.replaceChildren();
    status.textContent = query ? '正在加载索引…' : '';
    staticItems.forEach((item) => {
      item.hidden = !!query && !item.textContent?.trim().toLowerCase().includes(query);
    });
    actions.querySelectorAll<HTMLElement>('[data-command-group]').forEach((section) => {
      section.hidden = !section.querySelector('[data-command-item]:not([hidden])');
    });
    scrollArea.scrollTop = 0;
    select(0);
    if (!query) return;
    try {
      const posts = await loadSearchPosts();
      if (version !== searchVersion || !dialog.open) return;
      fuse ??= new Fuse(posts, {
        keys: [
          { name: 'displayTitle', weight: 3 }, { name: 'title', weight: 2 },
          'tags', 'categories', 'description', 'series',
        ],
        threshold: .32,
        ignoreLocation: true,
      });
      const fuzzy = query.length > 1 ? fuse.search(query, { limit: 10 }).map(({ item }) => item) : [];
      const exact = posts.filter((post) =>
        [post.displayTitle, post.title, post.description, post.series, ...post.tags, ...post.categories]
          .some((value) => value.toLowerCase().includes(query))
      );
      const fullText = posts.filter((post) => post.body.toLowerCase().includes(query));
      const matches = [...new Set([...exact, ...fuzzy, ...fullText])].slice(0, 10);
      results.replaceChildren(...matches.map((post) => resultRow(post, query)));
      status.textContent = matches.length ? '' : '没有找到相关文章。';
      select(0);
    } catch {
      if (version === searchVersion) status.textContent = '索引加载失败，重新输入可以重试。';
    }
  }

  function open() {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    input.value = '';
    input.focus();
    void search();
  }

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
      return;
    }
    if (!dialog.open || event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      input.focus();
      select(active + (event.key === 'ArrowDown' ? 1 : -1), true);
    }
    if (event.key === 'Enter' && event.target === input) {
      event.preventDefault();
      items()[active]?.click();
    }
  }, { signal });
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-command-open]')) open();
    if (target.closest('[data-theme-toggle]')) toggleTheme();
  }, { signal });
  dialog.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target === dialog || target.closest('[data-command-close]')) {
      dialog.close();
      return;
    }
    const link = target.closest<HTMLAnchorElement>('a[data-command-item]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      dialog.close();
      void navigate(link.href);
      return;
    }
    const action = target.closest<HTMLElement>('[data-command-action]')?.dataset.commandAction;
    if (!action) return;
    dialog.close();
    if (action === 'theme') toggleTheme();
    if (action === 'github') window.open(dialog.dataset.github, '_blank', 'noopener');
    if (action === 'rss') {
      try {
        await navigator.clipboard.writeText(new URL(dialog.dataset.rss!, location.origin).href);
        toast('RSS 链接已复制');
      } catch {
        toast('无法复制 RSS 链接');
      }
    }
  }, { signal });
  dialog.addEventListener('close', () => opener?.focus(), { signal });
  input.addEventListener('input', () => void search(), { signal });
}

let pageListeners: AbortController | undefined;
document.addEventListener('astro:page-load', () => {
  pageListeners?.abort();
  pageListeners = new AbortController();
  const { signal } = pageListeners;
  const dialog = document.querySelector<HTMLDialogElement>('[data-command]');
  if (dialog) setupCommand(dialog, signal);

  for (const key of document.querySelectorAll('[data-modifier]')) key.textContent = modifier;
  window.clearInterval(clockTimer);
  const clock = document.querySelector<HTMLElement>('[data-clock]');
  if (clock) {
    const updateClock = () => { clock.textContent = clockFormat.format(); };
    updateClock();
    clockTimer = window.setInterval(updateClock, 1000);
  }

  for (const tile of document.querySelectorAll<HTMLElement>('.bento .tile')) {
    tile.addEventListener('pointermove', (event) => {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      tile.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }, { signal, passive: true });
  }
  for (const cover of document.querySelectorAll<HTMLImageElement>('[data-project-visual] > img')) {
    function showFallback() {
      cover.hidden = true;
      const fallback = cover.parentElement?.querySelector<HTMLElement>('.visual-fallback');
      if (fallback) fallback.hidden = false;
    }
    cover.addEventListener('error', showFallback, { signal });
    if (cover.complete && !cover.naturalWidth) showFallback();
  }
});
