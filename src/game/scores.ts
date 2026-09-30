/** One player's personal best; app-created achievedAt values are ISO timestamps. */
export type ScoreEntry = { username: string; score: number; crossed: number; flies: number; achievedAt: string };
/** Match profiles without case or surrounding whitespace changing their identity. */
export const playerKey = (name: string) => name.trim().toLocaleLowerCase('en-US');
/**
 * Decode local storage. Invalid JSON/non-array envelopes throw; invalid records are dropped.
 * Timestamp syntax, score arithmetic, and extra properties are not normalized here.
 */
export function parseScores(raw: string | null): ScoreEntry[] {
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Invalid leaderboard');
  return value.filter((entry): entry is ScoreEntry => !!entry && typeof entry.username === 'string' &&
    entry.username.trim().length > 0 && Number.isSafeInteger(entry.score) && entry.score >= 0 &&
    Number.isSafeInteger(entry.crossed) && entry.crossed >= 0 && Number.isSafeInteger(entry.flies) &&
    entry.flies >= 0 && typeof entry.achievedAt === 'string');
}
/** Sort a copy by highest score, then earlier timestamp string, then username. */
export function rankScores(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.achievedAt.localeCompare(b.achievedAt) || a.username.localeCompare(b.username));
}
/** Keep all players; replace a personal best only when strictly improved, preserving ties. */
export function mergeScore(entries: ScoreEntry[], next: ScoreEntry) {
  const previous = entries.find(entry => playerKey(entry.username) === playerKey(next.username));
  const isBest = !previous || next.score > previous.score;
  return { isBest, entries: isBest ? rankScores([...entries.filter(entry => playerKey(entry.username) !== playerKey(next.username)), next]) : rankScores(entries) };
}
