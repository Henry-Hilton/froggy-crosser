// All coordinates are in board cells, independent of the device's pixel size.
export const COLUMNS = 7;
export const ROWS = 9;
export const ROUND_SECONDS = 90;
export const CROSSING_POINTS = 100;
export const FLY_POINTS = 25;
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Lane = { row: number; kind: 'log' | 'car' | 'truck' | 'racer'; speed: number; width: number; spacing: number; offset: number };
export const LANES: Lane[] = [
  { row: 1, kind: 'log', speed: 0.6, width: 2.5, spacing: 3.7, offset: 0.2 },
  { row: 2, kind: 'log', speed: -0.75, width: 2.3, spacing: 3.5, offset: 1.4 },
  { row: 3, kind: 'log', speed: 0.55, width: 2.6, spacing: 3.8, offset: 0 },
  { row: 5, kind: 'racer', speed: 2.5, width: 1.1, spacing: 4.4, offset: 1.3 },
  { row: 6, kind: 'truck', speed: -0.8, width: 1.9, spacing: 4.4, offset: 0.3 },
  { row: 7, kind: 'car', speed: 1.4, width: 1.25, spacing: 3.8, offset: 1.8 },
];
export type GameState = {
  elapsed: number; frog: { x: number; row: number }; crossed: number; flies: number;
  misses: number; cooldown: number; event: string; eventUntil: number; eventId: number;
  fly: { x: number; expires: number } | null; nextFly: number; finished: boolean;
};
export type Round = { score: number; crossed: number; flies: number; misses: number };
export function createGame(): GameState {
  return { elapsed: 0, frog: { x: 3.5, row: 8 }, crossed: 0, flies: 0, misses: 0,
    cooldown: 0, event: 'Swipe to the other side!', eventUntil: 3, eventId: 0,
    fly: null, nextFly: 4, finished: false };
}
export function objectsAt(lane: Lane, elapsed: number): number[] {
  const phase = ((lane.offset + elapsed * lane.speed) % lane.spacing + lane.spacing) % lane.spacing;
  const positions: number[] = [];
  for (let x = phase - lane.spacing; x < COLUMNS; x += lane.spacing) {
    if (x + lane.width > 0) positions.push(x);
  }
  return positions;
}
export function titleFor(crossed: number): string {
  return crossed >= 5 ? 'Apex Amphibian' : ['Unlucky Amphibian', 'Daring Tadpole', 'Pond Explorer', 'Agile Hopper', 'Highway Navigator'][crossed] ?? 'Unlucky Amphibian';
}
export function roundFor(state: GameState): Round {
  return { score: state.crossed * CROSSING_POINTS + state.flies * FLY_POINTS,
    crossed: state.crossed, flies: state.flies, misses: state.misses };
}
function announce(state: GameState, message: string) {
  state.event = message; state.eventUntil = state.elapsed + 1.6; state.eventId++;
}
function resetFrog(state: GameState) {
  state.frog = { x: 3.5, row: 8 }; state.cooldown = state.elapsed + 0.4;
}
function miss(state: GameState, message: string) {
  state.misses++; resetFrog(state); announce(state, message);
}
function checkPosition(state: GameState) {
  const { x, row } = state.frog;
  if (x < 0.25 || x > COLUMNS - 0.25) { miss(state, 'Swept away! Try again.'); return; }
  if (row === 0) {
    state.crossed++;
    const bonus = state.fly && Math.abs(x - state.fly.x) < 0.65;
    if (bonus) { state.flies++; state.fly = null; }
    resetFrog(state);
    announce(state, bonus ? '+125 · Safe crossing + gift!' : '+100 · Safe crossing!');
    return;
  }
  const lane = LANES.find(item => item.row === row);
  if (!lane) return;
  const positions = objectsAt(lane, state.elapsed);
  if (lane.kind === 'log') {
    if (!positions.some(left => x >= left + 0.15 && x <= left + lane.width - 0.15)) miss(state, 'Splash! Land on a log.');
  } else if (positions.some(left => x + 0.26 > left + 0.08 && x - 0.26 < left + lane.width - 0.08)) {
    miss(state, 'Bump! Watch the traffic.');
  }
}
export function moveFrog(current: GameState, direction: Direction): GameState {
  if (current.finished || current.elapsed < current.cooldown) return current;
  const state = { ...current, frog: { ...current.frog } };
  if (direction === 'up') state.frog.row = Math.max(0, state.frog.row - 1);
  if (direction === 'down') state.frog.row = Math.min(8, state.frog.row + 1);
  if (direction === 'left') state.frog.x = Math.max(0.5, state.frog.x - 1);
  if (direction === 'right') state.frog.x = Math.min(6.5, state.frog.x + 1);
  state.cooldown = state.elapsed + 0.11;
  checkPosition(state);
  return state;
}
export function advanceGame(current: GameState, seconds: number, random = Math.random): GameState {
  if (current.finished || seconds <= 0) return current;
  const state = { ...current, frog: { ...current.frog } };
  // Substeps prevent fast cars passing through a frog during a slow frame.
  let remaining = Math.min(seconds, ROUND_SECONDS - state.elapsed);
  while (remaining > 0.000001) {
    const dt = Math.min(remaining, 1 / 60);
    const lane = LANES.find(item => item.row === state.frog.row && item.kind === 'log');
    if (lane) state.frog.x += lane.speed * dt;
    state.elapsed += dt;
    if (state.fly && state.elapsed >= state.fly.expires) state.fly = null;
    if (state.elapsed >= state.nextFly) {
      state.fly = { x: Math.floor(random() * COLUMNS) + 0.5, expires: state.elapsed + 7 };
      state.nextFly = state.elapsed + 12;
    }
    checkPosition(state);
    remaining -= dt;
  }
  if (state.elapsed >= ROUND_SECONDS - 0.00001) { state.elapsed = ROUND_SECONDS; state.finished = true; }
  return state;
}
