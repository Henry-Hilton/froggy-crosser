import { PixelText as Text } from '@/components/pixel-text';
import { useState } from 'react';
import { router } from 'expo-router';
import { Modal, View } from 'react-native';
import { Button, PixelPanel, Eyebrow, FadeIn, PondHero, Screen, ui } from '@/components/game-ui';
import { colors } from '@/constants/game-theme';
import { usePlayer } from '@/state/player-context';
import { playerKey } from '@/game/scores';
const instructions = 'Swipe up, down, left or right to hop. Dodge cars, slow trucks and fast racing cars. Ride the moving logs across the river.\n\nReach the far bank for 100 points. Collect a gift there for 25 extra points. A collision or splash returns you to the start. Cross as many frogs as you can in 90 seconds!';
export default function Home() {
  const { username, scores } = usePlayer();
  const [help, setHelp] = useState(false);
  const best = scores.find(entry => playerKey(entry.username) === playerKey(username ?? ''))?.score ?? 0;
  function play() { setHelp(true); }
  return <Screen style={{ paddingTop: 10 }}>
    <Eyebrow>WELCOME BACK, {username}</Eyebrow>
    <FadeIn><Text style={ui.title}>Small frog.{'\n'}Big adventure.</Text></FadeIn>
    <Text style={ui.body}>A busy road. A rolling river.{'\n'}How many little leaps can you make?</Text>
    <PondHero />
    <PixelPanel style={[ui.row, { paddingVertical: 18 }]}>
      <View style={{ gap: 5 }}><Eyebrow>Personal best</Eyebrow><Text style={ui.heading}>{best.toLocaleString()} <Text style={{ fontSize: 14, color: colors.muted }}>pts</Text></Text></View>
      <View style={{ gap: 5, alignItems: 'flex-end' }}><Eyebrow>One round</Eyebrow><Text style={ui.heading}>90 <Text style={{ fontSize: 14, color: colors.muted }}>seconds</Text></Text></View>
    </PixelPanel>
    <Button title="Play Game" playIcon onPress={play} /><Button secondary title="High Scores" onPress={() => router.push('/high-scores')} />
    <Text style={[ui.body, { textAlign: 'center', fontSize: 12 }]}>Swipe to hop · Ride the logs · Find your way home</Text>
    <Modal visible={help} transparent animationType="fade" onRequestClose={() => setHelp(false)}>
      <View style={{ flex: 1, backgroundColor: '#183D3288', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <PixelPanel accessibilityViewIsModal style={[ { width: '100%', maxWidth: 440, gap: 20 }]}>
          <Text style={ui.heading}>Ready to cross?</Text><Text style={ui.body}>{instructions}</Text>
          <Button title="OK · Let’s play" onPress={() => { setHelp(false); router.push('/game'); }} />
          <Button title="Not yet" secondary onPress={() => setHelp(false)} />
        </PixelPanel>
      </View>
    </Modal>
  </Screen>;
}
