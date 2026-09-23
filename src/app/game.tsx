import { PixelText as Text } from '@/components/pixel-text';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Animated, AppState, BackHandler, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { art, Button, PixelPanel, Eyebrow, ui } from '@/components/game-ui';
import { PixelSurface } from '@/components/pixel-panel';
import { uiArrows } from '@/constants/ui-skins';
import { colors } from '@/constants/game-theme';
import { advanceGame, COLUMNS, createGame, LANES, moveFrog, objectsAt, ROUND_SECONDS, roundFor, ROWS, type Direction } from '@/game/engine';
import { usePlayer } from '@/state/player-context';
import { FrogSprite } from '@/components/frog-sprite';

export default function Game() {
  const { finishRound } = usePlayer();
  const [game, setGame] = useState(createGame);
  const current = useRef(createGame());
  const finish = useRef(finishRound);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [area, setArea] = useState({ width: 350, height: 450 });
  const [scale] = useState(() => new Animated.Value(1));
  const [direction, setDirection] = useState<Direction>('up');
  const [hopAt, setHopAt] = useState(-1);
  const gestureUsed = useRef(false);
  useEffect(() => { finish.current = finishRound; }, [finishRound]);
  const pause = useCallback((value: boolean) => { pausedRef.current = value; setPaused(value); setLeaving(false); }, []);
  const move = useCallback((nextDirection: Direction) => {
    if (pausedRef.current || current.current.finished) return;
    const next = moveFrog(current.current, nextDirection);
    if (next === current.current) return;
    const reset = next.misses !== current.current.misses || next.crossed !== current.current.crossed;
    current.current = next; setGame(next); setDirection(reset ? 'up' : nextDirection); setHopAt(next.elapsed);
    scale.setValue(1.08);
    Animated.spring(scale, { toValue: 1, speed: 24, bounciness: 7, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [scale]);
  useFocusEffect(useCallback(() => {
    let cancelled = false;
    let frame = 0;
    let previous = performance.now();
    let lastRender = previous;
    function tick(now: number) {
      const delta = Math.max(0, (now - previous) / 1000); previous = now;
      if (!pausedRef.current && !current.current.finished) {
        current.current = advanceGame(current.current, delta);
        if (current.current.finished) {
          setGame(current.current);
          void finish.current(roundFor(current.current)).then(() => { if (!cancelled) router.replace('/result'); });
          return;
        }
        if (now - lastRender >= 1000 / 30) { setGame(current.current); lastRender = now; }
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    const appState = AppState.addEventListener('change', state => { if (state !== 'active') pause(true); });
    const back = BackHandler.addEventListener('hardwareBackPress', () => { pause(true); return true; });
    return () => { cancelled = true; cancelAnimationFrame(frame); appState.remove(); back.remove(); scale.stopAnimation(); };
  }, [pause, scale]));
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const keys: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
    const keydown = (event: KeyboardEvent) => {
      if (keys[event.key]) { event.preventDefault(); move(keys[event.key]); }
      if (event.key === 'Escape') pause(!pausedRef.current);
    };
    const visibility = () => { if (document.hidden) pause(true); };
    document.addEventListener('keydown', keydown); document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('visibilitychange', visibility); };
  }, [move, pause]);
  const responder = useMemo(() => {
    // PanResponder registers these handlers; it only reads refs later during touch events.
    // eslint-disable-next-line react-hooks/refs
    return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { gestureUsed.current = false; },
    onPanResponderMove: (_, gesture) => {
      if (gestureUsed.current || Math.max(Math.abs(gesture.dx), Math.abs(gesture.dy)) < 18) return;
      gestureUsed.current = true;
      move(Math.abs(gesture.dx) > Math.abs(gesture.dy) ? gesture.dx > 0 ? 'right' : 'left' : gesture.dy > 0 ? 'down' : 'up');
    },
    onPanResponderTerminationRequest: () => false,
    });
  }, [move]);
  const width = Math.max(140, Math.min(area.width - 24, area.height * COLUMNS / ROWS, 490));
  const cell = width / COLUMNS;
  const seconds = Math.ceil(ROUND_SECONDS - game.elapsed);
  const score = roundFor(game).score;
  const hopAge = game.elapsed - hopAt;
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <View style={ui.row}><View><Eyebrow>THE CROSSING</Eyebrow><Text style={[ui.heading, { fontSize: 24 }]}>Make the leap.</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Pause game" onPress={() => pause(true)} style={styles.pause}>{({ pressed }) => <><PixelSurface skin={pressed ? 'greyPressed' : 'grey'} /><Text style={{ color: colors.ink, fontWeight: '900' }}>Ⅱ</Text></>}</Pressable>
      </View>
      <PixelPanel style={[ui.row, { marginTop: 12, paddingVertical: 12 }]}>
        <View><Eyebrow>SCORE</Eyebrow><Text style={styles.stat}>{score}</Text></View>
        <View style={{ alignItems: 'center' }}><Eyebrow>CROSSED</Eyebrow><Text style={styles.stat}>{game.crossed}</Text></View>
        <View style={{ alignItems: 'flex-end' }}><Eyebrow>TIME LEFT</Eyebrow><Text style={[styles.stat, seconds <= 15 && { color: colors.danger }]}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text></View>
      </PixelPanel>
      <View style={styles.track}><PixelSurface skin="grey" /><View style={{ height: 16, width: `${seconds / ROUND_SECONDS * 100}%`, minWidth: seconds > 0 ? 16 : 0, overflow: 'hidden' }}><PixelSurface skin={seconds <= 15 ? 'red' : 'green'} /></View></View>
    </View>
    <View style={styles.boardArea} onLayout={event => setArea(event.nativeEvent.layout)}>
      <View testID="game-board" accessibilityLabel="Game board. Swipe in any direction to move the frog." {...responder.panHandlers}
        style={[styles.board, { width, height: cell * ROWS }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {Array.from({ length: ROWS }, (_, row) => <View key={row} style={{ position: 'absolute', top: row * cell, height: cell, width,
            backgroundColor: row <= 3 && row > 0 ? '#72E9EB' : row >= 5 && row <= 7 ? '#343D57' : '#34B463' }}>
            {Array.from({ length: 7 }, (_, column) => <Image key={column} source={row === 0 || row === 4 || row === 8 ? art.grass : row < 4 ? art.water : art.road} contentFit="fill" style={{ position: 'absolute', left: column * cell, width: cell, height: cell }} />)}
            {(row === 5 || row === 6) && Array.from({ length: 7 }, (_, column) => <Image key={column} source={art.roadStripe} contentFit="fill" style={{ position: 'absolute', left: column * cell, top: cell * 0.8, width: cell, height: cell * 0.2 }} />)}
            {(row === 1 || row === 3) && Array.from({ length: 7 }, (_, column) => <Image key={column} source={row === 1 ? art.shoreTop : art.shoreBottom} contentFit="fill" style={{ position: 'absolute', left: column * cell, top: row === 1 ? 0 : cell * 0.8, width: cell, height: cell * 0.2 }} />)}
            {row === 0 && <Text style={[styles.bankLabel, { fontSize: Math.max(9, cell * 0.22) }]}>FAR BANK · +100</Text>}
            {row === 4 && <Text style={[styles.bankLabel, { fontSize: Math.max(9, cell * 0.22) }]}>TAKE A BREATHER</Text>}
            {row === 8 && <Text style={[styles.bankLabel, { fontSize: Math.max(9, cell * 0.22), textAlign: 'left', paddingLeft: 12 }]}>START</Text>}
          </View>)}
          {LANES.map(lane => objectsAt(lane, game.elapsed).map((x, index) => <Image key={`${lane.row}-${index}`} source={art[lane.kind]} contentFit="fill"
            style={{ position: 'absolute', left: x * cell, top: (lane.row + 0.13) * cell, width: lane.width * cell, height: cell * 0.74, transform: [{ scaleX: lane.speed < 0 ? -1 : 1 }] }} />))}
          {game.fly && <Image source={art.gift} contentFit="contain" style={{ position: 'absolute', left: (game.fly.x - 0.35) * cell, top: cell * 0.12, width: cell * 0.7, height: cell * 0.7, opacity: 0.85 + Math.sin(game.elapsed * 6) * 0.15 }} />}
          <Animated.View style={{ position: 'absolute', left: (game.frog.x - 0.45) * cell, top: (game.frog.row + 0.08) * cell, width: cell * 0.9, height: cell * 0.84, transform: [{ scale }] }}>
            <FrogSprite direction={direction} frame={hopAge < 0.3 ? Math.min(4, Math.floor(hopAge / 0.06)) : Math.floor(game.elapsed * 3)} hopping={hopAge < 0.3} style={{ width: '100%', height: '100%' }} />
          </Animated.View>
        </View>
      </View>
    </View>
    <View style={styles.footer}>
      <Text accessibilityLiveRegion="polite" style={styles.notice}>{game.finished ? 'Round complete. Saving your adventure…' : game.elapsed < game.eventUntil ? game.event : game.fly ? 'Gift on the far bank · +25 bonus' : 'Swipe anywhere on the board to hop'}</Text>
      <View style={styles.controls}>
        {(['left', 'up', 'down', 'right'] as Direction[]).map(item => <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Hop ${item}`} disabled={paused || game.finished} onPress={() => move(item)}
          style={styles.control}>{({ pressed }) => <><PixelSurface skin={pressed ? 'greyPressed' : 'grey'} /><Image source={uiArrows[item]} contentFit="contain" style={{ width: 32, height: 32, transform: [{ translateY: pressed ? 2 : 0 }] }} /></>}</Pressable>)}
      </View>
      <Text style={styles.tip}>100 / crossing    ·    25 / gift    ·    Unlimited retries</Text>
    </View>
    {paused && !game.finished && <View style={styles.overlay} accessibilityViewIsModal>
      <PixelPanel style={[ { width: '100%', maxWidth: 370, gap: 18 }]}>
        <Eyebrow>A MOMENT ON THE BANK</Eyebrow><Text style={ui.heading}>{leaving ? 'Leave this round?' : 'Catch your breath.'}</Text>
        <Text style={ui.body}>{leaving ? 'This unfinished round will not be saved.' : 'The timer and traffic are paused. Your next leap can wait.'}</Text>
        <Button title="Resume Game" onPress={() => pause(false)} />
        <Button secondary title={leaving ? 'Yes, Main Menu' : 'Main Menu'} onPress={() => leaving ? router.replace('/') : setLeaving(true)} />
      </PixelPanel>
    </View>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 12, width: '100%', maxWidth: 540, alignSelf: 'center' },
  pause: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center',  },
  stat: { fontSize: 28, color: colors.ink, fontWeight: '800', fontVariant: ['tabular-nums'] },
  track: { height: 16, marginTop: 10 },
  boardArea: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 180 },
  board: { overflow: 'hidden', borderRadius: 4, backgroundColor: colors.water, userSelect: 'none' },
  bankLabel: { color: '#103D27', textAlign: 'center', fontWeight: '800', letterSpacing: 1, marginTop: 5 },
  footer: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: 8, alignItems: 'center', gap: 8 },
  notice: { fontSize: 12, minHeight: 20, color: colors.deep, fontWeight: '600', textAlign: 'center' },
  controls: { flexDirection: 'row', gap: 12 },
  control: { width: 58, height: 48, alignItems: 'center', justifyContent: 'center' },
  tip: { fontSize: 10, color: colors.muted, letterSpacing: 0.3 },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#183D3288', padding: 24, alignItems: 'center', justifyContent: 'center' },
});
