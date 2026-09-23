import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Round } from '@/game/engine';
import { mergeScore, parseScores, playerKey, type ScoreEntry } from '@/game/scores';
const USER_KEY = '@froggy/username';
const SCORES_KEY = '@froggy/scores-v1';
type SavedRound = Round & { username: string; isBest: boolean };
type PlayerContextType = {
  username: string | null; ready: boolean; storageError: string | null; scores: ScoreEntry[];
  result: SavedRound | null; saving: boolean; saveError: string | null;
  hydrate: () => Promise<void>; login: (name: string) => Promise<void>; logout: () => Promise<void>;
  finishRound: (round: Round) => Promise<void>; retrySave: () => Promise<void>;
};
const PlayerContext = createContext<PlayerContextType | null>(null);
export function PlayerProvider({ children }: PropsWithChildren) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [result, setResult] = useState<SavedRound | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hydrate = useCallback(() => Promise.all([AsyncStorage.getItem(USER_KEY), AsyncStorage.getItem(SCORES_KEY)])
    .then(([user, raw]) => {
      setScores(parseScores(raw)); setUsername(user?.trim() || null); setStorageError(null); setReady(true);
    }).catch(() => { setStorageError('We could not read your saved profile. Please retry.'); }), []);
  useEffect(() => { void hydrate(); }, [hydrate]);
  async function login(name: string) {
    const cleaned = name.trim();
    if (!cleaned || cleaned.length > 20) throw new Error('Enter a username with 1–20 characters.');
    await AsyncStorage.setItem(USER_KEY, cleaned); setUsername(cleaned); setResult(null);
  }
  async function logout() {
    await AsyncStorage.removeItem(USER_KEY); setUsername(null); setResult(null);
  }
  async function saveRound(round: SavedRound) {
    setSaving(true); setSaveError(null);
    try {
      const existing = parseScores(await AsyncStorage.getItem(SCORES_KEY));
      const merged = mergeScore(existing, { ...round, achievedAt: new Date().toISOString() });
      await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(merged.entries));
      setScores(merged.entries); setResult({ ...round, isBest: merged.isBest });
    } catch { setSaveError('Your score could not be saved. Retry before leaving this screen.'); }
    finally { setSaving(false); }
  }
  async function finishRound(round: Round) {
    if (!username) return;
    const previous = scores.find(entry => playerKey(entry.username) === playerKey(username));
    const next = { ...round, username, isBest: !previous || round.score > previous.score };
    setResult(next); await saveRound(next);
  }
  return <PlayerContext.Provider value={{ username, ready, scores, result, saving, saveError, storageError, hydrate, login, logout, finishRound,
    retrySave: async () => { if (result) await saveRound(result); } }}>{children}</PlayerContext.Provider>;
}
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer requires PlayerProvider');
  return context;
}
