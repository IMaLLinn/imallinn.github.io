const directions = {
  left: [-1, 0], up: [0, -1], down: [0, 1], right: [1, 0],
} as const;
type Direction = keyof typeof directions;
const arrows: Partial<Record<string, Direction>> = {
  ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down', ArrowRight: 'right',
};
const size = 5;

function step(index: number, direction: Direction) {
  const [dx, dy] = directions[direction];
  const x = index % size + dx;
  const y = Math.floor(index / size) + dy;
  return x >= 0 && y >= 0 && x < size && y < size ? y * size + x : -1;
}

function setupSokoban(game: HTMLElement, signal: AbortSignal) {
  const board = game.querySelector<HTMLElement>('[data-sokoban-board]')!;
  const cells = [...board.querySelectorAll<HTMLElement>('[data-cell]')];
  const playerSprite = board.querySelector('[data-player]')!;
  const boxSprite = board.querySelector('[data-box]')!;
  const status = game.querySelector<HTMLElement>('[data-sokoban-status]')!;
  const startPlayer = cells.findIndex(({ dataset }) => dataset.tile === 'p');
  const startBox = cells.findIndex(({ dataset }) => dataset.tile === 'b');
  const goal = cells.findIndex(({ dataset }) => dataset.tile === 'g');
  let player = startPlayer;
  let box = startBox;
  let solved = false;

  const position = (index: number) => `第 ${Math.floor(index / size) + 1} 行第 ${index % size + 1} 列`;

  function render() {
    cells[player].append(playerSprite);
    cells[box].append(boxSprite);
    game.toggleAttribute('data-solved', solved);
    for (const cell of cells) cell.removeAttribute('data-neighbor');
    if (!solved) {
      for (const direction of Object.keys(directions) as Direction[]) {
        const adjacent = cells[step(player, direction)];
        if (adjacent && adjacent.dataset.tile !== '#') adjacent.dataset.neighbor = '';
      }
    }
    const boardState = `猫在${position(player)}，箱子在${position(box)}，目标在${position(goal)}。`;
    status.textContent = solved ? '箱子已推到目标，可以重玩。' : boardState;
  }

  function move(direction: Direction) {
    if (solved) return;
    const next = step(player, direction);
    if (!cells[next] || cells[next].dataset.tile === '#') return;
    if (next === box) {
      const destination = step(box, direction);
      if (!cells[destination] || cells[destination].dataset.tile === '#') return;
      box = destination;
    }
    player = next;
    solved = box === goal;
    render();
  }

  board.addEventListener('keydown', (event) => {
    const direction = arrows[event.key];
    if (!direction || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    move(direction);
  }, { signal });
  board.addEventListener('click', (event) => {
    const target = event.target;
    const cell = target instanceof Element ? target.closest<HTMLElement>('[data-cell]') : null;
    if (!cell) return;
    const index = Number(cell.dataset.cell);
    const direction = (Object.keys(directions) as Direction[]).find((candidate) => step(player, candidate) === index);
    if (direction) move(direction);
  }, { signal });
  for (const button of game.querySelectorAll<HTMLButtonElement>('[data-move]')) {
    button.addEventListener('click', () => move(button.dataset.move as Direction), { signal });
  }
  game.querySelector('[data-restart]')?.addEventListener('click', () => {
    player = startPlayer;
    box = startBox;
    solved = false;
    render();
  }, { signal });
  render();
}

function setupPlot(plot: HTMLElement, card: HTMLElement, signal: AbortSignal) {
  const line = plot.querySelector<SVGPathElement>('[data-plot-line]')!;
  const area = plot.querySelector<SVGPathElement>('[data-plot-area]')!;
  const dot = plot.querySelector<SVGCircleElement>('[data-plot-dot]')!;
  const reading = plot.querySelector<HTMLElement>('[data-plot-reading]')!;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let pointer: number | undefined;
  let phase = 0;
  let marker = 105;
  let raf = 0;
  let previous = 0;

  function draw() {
    const sample = (x: number) => .81 * Math.sin(x * Math.PI / 86 - .85 + phase);
    const y = (x: number) => 38 - sample(x) * 29;
    let path = `M0 ${y(0).toFixed(2)}`;
    for (let x = 5; x <= 210; x += 5) path += `L${x} ${y(x).toFixed(2)}`;
    line.setAttribute('d', path);
    area.setAttribute('d', path + 'V76H0Z');
    dot.setAttribute('cx', marker.toFixed(1));
    dot.setAttribute('cy', y(marker).toFixed(1));
    const value = `f(x) = ${sample(marker).toFixed(2)}`;
    if (value !== reading.textContent) reading.textContent = value;
  }

  function frame(now: number) {
    const elapsed = previous ? Math.min(50, now - previous) : 16;
    previous = now;
    const targetPhase = pointer === undefined ? Math.sin(now / 1700) * .24 : (pointer - .5) * 3.8;
    const targetMarker = pointer === undefined ? 105 + Math.sin(now / 2250) * 10 : 16 + pointer * 152;
    const ease = 1 - Math.exp(-elapsed / (pointer === undefined ? 420 : 135));
    phase += (targetPhase - phase) * ease;
    marker += (targetMarker - marker) * ease;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function syncAnimation() {
    if (visible && !reducedMotion.matches && !document.hidden) {
      if (!raf) raf = requestAnimationFrame(frame);
      return;
    }
    cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
  }

  card.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    pointer = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  }, { signal, passive: true });
  card.addEventListener('pointerleave', () => { pointer = undefined; }, { signal });
  reducedMotion.addEventListener('change', syncAnimation, { signal });
  document.addEventListener('visibilitychange', syncAnimation, { signal });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncAnimation();
  });
  observer.observe(plot);
  signal.addEventListener('abort', () => {
    observer.disconnect();
    cancelAnimationFrame(raf);
  }, { once: true });
  draw();
}

let homeListeners: AbortController | undefined;
document.addEventListener('astro:before-swap', () => homeListeners?.abort());
document.addEventListener('astro:page-load', () => {
  homeListeners?.abort();
  const bento = document.querySelector('.bento');
  if (!bento) return;
  homeListeners = new AbortController();
  const { signal } = homeListeners;
  const game = bento.querySelector<HTMLElement>('[data-sokoban]');
  if (game) setupSokoban(game, signal);
  const plot = bento.querySelector<HTMLElement>('[data-function-plot]');
  const card = plot?.closest<HTMLElement>('.horizontal-feature');
  if (plot && card) setupPlot(plot, card, signal);
});
