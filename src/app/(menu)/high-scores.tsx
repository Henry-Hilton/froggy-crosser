import { PixelText as Text } from '@/components/pixel-text';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { art, Button, PixelPanel, Eyebrow, FadeIn, RankPortrait, Screen, ui } from '@/components/game-ui';
import { usePlayer } from '@/state/player-context';
import { playerKey, rankScores } from '@/game/scores';
export default function HighScores() {
  const { scores, username } = usePlayer();
  const leaders = rankScores(scores).slice(0, 3);
  return <Screen>
    <Eyebrow>THE LOCAL LEADERBOARD</Eyebrow><Text style={ui.title}>Hall of{'\n'}Hoppers.</Text>
    <Text style={ui.body}>Three places. Plenty of little leaps.{'\n'}The best score for each player, saved on this device.</Text>
    {leaders.length === 0 ? <PixelPanel style={[ { alignItems: 'center', gap: 16, paddingVertical: 36 }]}>
      <Image source={art.medals[0]} style={{ width: 88, height: 100 }} /><Text style={ui.heading}>Your pond awaits.</Text>
      <Text style={[ui.body, { textAlign: 'center' }]}>Finish your first round to put your name on the board.</Text>
    </PixelPanel> : leaders.map((entry, index) => <FadeIn key={playerKey(entry.username)}>
      <PixelPanel style={[ ui.row]}>
        <RankPortrait rank={index + 1} />
        <View style={{ flex: 1, gap: 6 }}><Text style={[ui.heading, { fontSize: 20 }]} numberOfLines={1}>{entry.username}</Text>
          <Text style={[ui.body, { fontSize: 12 }]}>{entry.crossed} frogs crossed{playerKey(entry.username) === playerKey(username ?? '') ? ' · You' : ''}</Text></View>
        <View style={{ alignItems: 'flex-end' }}><Text style={[ui.heading, { fontSize: 25 }]}>{entry.score}</Text><Eyebrow>POINTS</Eyebrow></View>
      </PixelPanel>
    </FadeIn>)}
    <View style={{ marginTop: 'auto' }}><Button secondary title="Main Menu" onPress={() => router.replace('/')} /></View>
  </Screen>;
}
