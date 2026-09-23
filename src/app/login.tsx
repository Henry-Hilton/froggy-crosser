import { PixelText as Text } from '@/components/pixel-text';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { Button, PixelPanel, Eyebrow, FadeIn, PondHero, Screen, ui } from '@/components/game-ui';
import { colors } from '@/constants/game-theme';
import { usePlayer } from '@/state/player-context';
export default function Login() {
  const { login } = usePlayer();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (busy || !name.trim()) return;
    setBusy(true); setError('');
    try { await login(name); } catch { setError('Could not save your profile. Please try again.'); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Screen style={{ justifyContent: 'center' }}>
      <Eyebrow>A little leap. A big adventure.</Eyebrow>
      <FadeIn><Text style={ui.title}>Froggy{'\n'}Crosser<Text style={{ color: '#7CA355' }}>.</Text></Text></FadeIn>
      <PondHero />
      <View style={{ gap: 8 }}><Text style={ui.heading}>Hello, hopper.</Text><Text style={ui.body}>Pick a name and make a splash. Your best crossings stay saved on this device.</Text></View>
      <View style={{ gap: 10 }}><Eyebrow>Your username</Eyebrow>
        <PixelPanel skin="inlay" style={{ padding: 8 }}><TextInput accessibilityLabel="Username" placeholder="e.g. LilyHopper" placeholderTextColor="#8A978B" value={name} onChangeText={setName}
          maxLength={20} autoCapitalize="none" autoCorrect={false} returnKeyType="go" onSubmitEditing={() => void submit()}
          style={{ padding: 12, fontFamily: 'Pixel', fontSize: 22, color: colors.ink }} /></PixelPanel>
        {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
      </View>
      <Button title={busy ? 'Saving…' : 'Let’s hop in  →'} disabled={busy || !name.trim()} onPress={() => void submit()} />
      <Text style={[ui.body, { textAlign: 'center', fontSize: 12 }]}>No password needed. Just your next personal best.</Text>
    </Screen>
  </KeyboardAvoidingView>;
}

