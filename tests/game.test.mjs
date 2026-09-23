import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceGame, createGame, LANES, moveFrog, objectsAt, roundFor, titleFor } from '../src/game/engine.ts';
import { mergeScore, parseScores, rankScores } from '../src/game/scores.ts';

test('the frog starts safely and responds to four directions within bounds', () => {
  const state = createGame();
  assert.deepEqual(state.frog, { x: 3.5, row: 8 });
  assert.equal(moveFrog(state, 'left').frog.x, 2.5);
  assert.equal(moveFrog(state, 'right').frog.x, 4.5);
  assert.equal(moveFrog({ ...state, frog: { x: 3.5, row: 4 } }, 'down').frog.row, 5);
  assert.equal(moveFrog(state, 'up').frog.row, 7);
  assert.equal(moveFrog({ ...state, frog: { x: 0.5, row: 8 } }, 'left').frog.x, 0.5);
  assert.equal(moveFrog(state, 'down').frog.row, 8);
});
test('vehicle types have distinct speeds and all cause a reset on collision', () => {
  const vehicles = LANES.filter(lane => lane.kind !== 'log');
  assert.ok(Math.abs(vehicles.find(l => l.kind === 'truck').speed) < Math.abs(vehicles.find(l => l.kind === 'car').speed));
  assert.ok(Math.abs(vehicles.find(l => l.kind === 'car').speed) < Math.abs(vehicles.find(l => l.kind === 'racer').speed));
  for (const lane of vehicles) {
    const x = objectsAt(lane, 0).find(x => x >= 0) + lane.width / 2;
    const next = advanceGame({ ...createGame(), frog: { row: lane.row, x } }, 1 / 60);
    assert.equal(next.misses, 1, lane.kind); assert.equal(next.frog.row, 8);
  }
});
test('a frog rides a log and drowns in a gap', () => {
  const state = { ...createGame(), frog: { x: 1, row: 3 } };
  const next = advanceGame(state, 0.5);
  assert.equal(next.misses, 0); assert.ok(Math.abs(next.frog.x - 1.275) < 0.001);
  const splash = advanceGame({ ...createGame(), frog: { x: 3.1, row: 3 } }, 0.01);
  assert.equal(splash.misses, 1); assert.equal(splash.frog.row, 8);
});
test('drifting beyond the board resets the frog', () => {
  const next = advanceGame({ ...createGame(), frog: { x: 6.74, row: 3 } }, 0.1);
  assert.equal(next.frog.row, 8); assert.equal(next.misses, 1);
});
test('crossings award base points and a new frog without losing time', () => {
  const next = moveFrog({ ...createGame(), elapsed: 10, frog: { x: 3.5, row: 1 } }, 'up');
  assert.equal(next.crossed, 1); assert.equal(roundFor(next).score, 100);
  assert.equal(next.elapsed, 10); assert.equal(next.frog.row, 8);
});
test('a fly is collected once only when crossing its cell', () => {
  const next = moveFrog({ ...createGame(), fly: { x: 3.5, expires: 7 }, frog: { x: 3.5, row: 1 } }, 'up');
  assert.equal(next.flies, 1); assert.equal(roundFor(next).score, 125); assert.equal(next.fly, null);
  const other = moveFrog({ ...createGame(), fly: { x: 0.5, expires: 7 }, frog: { x: 3.5, row: 1 } }, 'up');
  assert.equal(other.flies, 0);
});
test('flies spawn randomly, expire and respawn', () => {
  const spawned = advanceGame(createGame(), 4.1, () => 0.5);
  assert.equal(spawned.fly.x, 3.5);
  const expired = advanceGame(spawned, 7.1, () => 0.5);
  assert.equal(expired.fly, null);
  assert.ok(advanceGame(expired, 5.1, () => 0.1).fly);
});
test('timer ends exactly at 90 seconds and ignores subsequent moves', () => {
  const next = advanceGame(createGame(), 95);
  assert.equal(next.elapsed, 90); assert.equal(next.finished, true);
  assert.strictEqual(moveFrog(next, 'up'), next); assert.strictEqual(advanceGame(next, 1), next);
});
test('all six titles match the assignment', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 10].map(titleFor), ['Unlucky Amphibian', 'Daring Tadpole', 'Pond Explorer', 'Agile Hopper', 'Highway Navigator', 'Apex Amphibian', 'Apex Amphibian']);
});
const entry = (username, score) => ({ username, score, crossed: score / 100, flies: 0, achievedAt: '2026-09-23T00:00:00Z' });
test('personal bests survive lower scores, ties, and case changes', () => {
  const first = mergeScore([], entry('Lily', 300));
  assert.equal(first.isBest, true);
  assert.equal(mergeScore(first.entries, entry('lily', 100)).entries[0].score, 300);
  assert.equal(mergeScore(first.entries, entry('Lily', 300)).isBest, false);
  const better = mergeScore(first.entries, entry('LILY', 400));
  assert.equal(better.entries.length, 1); assert.equal(better.entries[0].score, 400);
});
test('top three rank correctly while retaining every player for future bests', () => {
  const entries = [entry('A', 100), entry('B', 400), entry('C', 300), entry('D', 200)];
  assert.deepEqual(rankScores(entries).slice(0, 3).map(e => e.username), ['B', 'C', 'D']);
  assert.equal(mergeScore(entries, entry('A', 0)).entries.length, 4);
  assert.deepEqual(parseScores(JSON.stringify(entries)), entries);
});
test('storage parsing rejects invalid envelopes and filters invalid records', () => {
  assert.deepEqual(parseScores(null), []);
  assert.throws(() => parseScores('{broken'));
  assert.throws(() => parseScores('{}'));
  assert.deepEqual(parseScores(JSON.stringify([entry('A', 100), { username: 'Bad', score: -5 }])), [entry('A', 100)]);
});
test('simulation is independent of frame rate', () => {
  let stepped = { ...createGame(), frog: { x: 1, row: 3 } };
  const continuous = advanceGame(stepped, 0.5);
  for (let i = 0; i < 30; i++) stepped = advanceGame(stepped, 1 / 60);
  assert.ok(Math.abs(continuous.frog.x - stepped.frog.x) < 1e-8);
  assert.equal(continuous.misses, stepped.misses);
});
