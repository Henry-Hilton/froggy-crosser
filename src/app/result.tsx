import { PixelText as Text } from '@/components/pixel-text';
import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { Button, PixelPanel, Eyebrow, FadeIn, PondHero, Screen, ui } from '@/components/game-ui';
import { colors } from '@/constants/game-theme';
import { titleFor } from '@/game/engine';
import { usePlayer } from '@/state/player-context';
export default function Result() {
  const { result, saving, saveError, retrySave } = usePlayer();
  if (!result) return <Redirect href="/" />;
  return <Screen>
    <Eyebrow>ROUND COMPLETE · {result.username}</Eyebrow>
    <FadeIn><Text style={ui.title}>{titleFor(result.crossed)}.</Text></FadeIn><PondHero small />
    <FadeIn style={{ alignItems: 'center', gap: 4 }}><Eyebrow>FINAL SCORE</Eyebrow><Text style={{ fontSize: 70, fontWeight: '900', color: colors.ink, letterSpacing: -3 }}>{result.score}</Text>
      <Text style={{ color: result.isBest ? '#58732C' : colors.muted, fontWeight: '700', fontSize: 14 }}>{saving ? 'Saving your score…' : saveError ? 'Score not saved yet' : result.isBest ? '✦ A new personal best!' : 'Another adventure in the books.'}</Text>
    </FadeIn>
    <PixelPanel style={[ui.row, { paddingVertical: 18 }]}>
      {[['FROGS', result.crossed], ['BONUS GIFTS', result.flies], ['RESETS', result.misses]].map(([label, value]) => <View key={label} style={{ alignItems: 'center', gap: 8 }}><Text style={ui.heading}>{value}</Text><Eyebrow>{label}</Eyebrow></View>)}
    </PixelPanel>
    <Text style={[ui.body, { textAlign: 'center', fontSize: 12 }]}>{result.crossed} crossings × 100 + {result.flies} gifts × 25</Text>
    {!!saveError && <><Text style={ui.error}>{saveError}</Text><Button title="Retry saving" disabled={saving} onPress={() => void retrySave()} /></>}
    <Button title="Play Again" playIcon disabled={saving || !!saveError} onPress={() => router.replace('/game')} />
    <View style={ui.row}><View style={{ flex: 1 }}><Button title="High Scores" secondary disabled={saving || !!saveError} onPress={() => router.replace('/high-scores')} /></View><View style={{ flex: 1 }}><Button title="Main Menu" secondary disabled={saving || !!saveError} onPress={() => router.replace('/')} /></View></View>
  </Screen>;
}
