let pageListeners: AbortController | undefined;

document.addEventListener('astro:before-swap', () => pageListeners?.abort());

document.addEventListener('astro:page-load', () => {
  pageListeners?.abort();
  const body = document.querySelector<HTMLElement>('[data-article-body]');
  if (!body) return;
  pageListeners = new AbortController();
  const { signal } = pageListeners;

  for (const block of body.querySelectorAll<HTMLPreElement>('pre')) {
    const code = block.querySelector('code');
    if (!code || block.parentElement?.classList.contains('code-panel')) continue;
    const panel = document.createElement('div');
    panel.className = 'code-panel not-prose';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const label = document.createElement('span');
    label.textContent = block.dataset.language ?? code.className.match(/language-([\w+-]+)/)?.[1] ?? 'text';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = '复制';
    copy.setAttribute('aria-live', 'polite');
    let timer: number | undefined;
    copy.addEventListener('click', async () => {
      window.clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(code.textContent ?? '');
        copy.textContent = '已复制';
      } catch {
        copy.textContent = '复制失败';
      }
      timer = window.setTimeout(() => { copy.textContent = '复制'; }, 1700);
    }, { signal });
    toolbar.append(label, copy);
    block.before(panel);
    panel.append(toolbar, block);
  }

  for (const table of body.querySelectorAll('table')) {
    if (table.parentElement?.classList.contains('table-scroll')) continue;
    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', '表格，可横向滚动');
    table.before(scroll);
    scroll.append(table);
  }

  const lightbox = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (lightbox) {
    const boxImage = lightbox.querySelector('img')!;
    const caption = lightbox.querySelector<HTMLElement>('[data-image-caption]')!;
    const close = lightbox.querySelector<HTMLButtonElement>('[data-lightbox-close]')!;
    let focused: HTMLElement | null;
    for (const image of body.querySelectorAll<HTMLImageElement>('img')) {
      if (image.closest('a, button')) continue;
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', image.alt ? '放大图片：' + image.alt : '放大图片');
      image.loading = 'lazy';
      const open = () => {
        focused = image;
        boxImage.src = image.currentSrc || image.src;
        boxImage.alt = image.alt;
        caption.textContent = image.alt;
        lightbox.showModal();
        close.focus();
      };
      image.addEventListener('click', open, { signal });
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }, { signal });
    }
    close.addEventListener('click', () => lightbox.close(), { signal });
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); }, { signal });
    lightbox.addEventListener('close', () => focused?.focus({ preventScroll: true }), { signal });
  }

  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[data-heading]')];
  const sections = links.map((link) => document.getElementById(link.dataset.heading!));
  if (!sections.length) return;
  let scheduled = false;
  let active = -1;
  function syncToc() {
    scheduled = false;
    if (signal.aborted) return;
    let next = 0;
    for (let index = 0; index < sections.length; index++) {
      const heading = sections[index];
      if (heading && heading.getBoundingClientRect().top <= 133) next = index;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      // The last headings may never reach the top when the page runs out of room to scroll.
      const requested = links.findIndex((link) => link.hash === location.hash);
      const top = sections[requested]?.getBoundingClientRect().top;
      if (top !== undefined && top >= 0 && top < window.innerHeight) next = requested;
      else if (window.scrollY > 0) next = links.length - 1;
    }
    if (active === next) return;
    links[active]?.removeAttribute('aria-current');
    const link = links[next];
    link.setAttribute('aria-current', 'location');
    const list = link.closest('ol');
    if (list) {
      const bounds = list.getBoundingClientRect();
      const item = link.getBoundingClientRect();
      if (item.top < bounds.top) list.scrollTop += item.top - bounds.top;
      else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
    }
    active = next;
  }
  function scheduleToc() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(syncToc);
    }
  }
  window.addEventListener('scroll', scheduleToc, { signal, passive: true });
  window.addEventListener('hashchange', scheduleToc, { signal });
  window.addEventListener('popstate', scheduleToc, { signal });
  window.addEventListener('resize', scheduleToc, { signal });
  body.addEventListener('load', scheduleToc, { signal, capture: true });
  syncToc();
});
