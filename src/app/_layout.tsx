import { useFonts } from 'expo-font';
import { PixelText as Text } from '@/components/pixel-text';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlayerProvider, usePlayer } from '@/state/player-context';
import { Button, Screen, ui } from '@/components/game-ui';
import { colors } from '@/constants/game-theme';
/** Wait for profile hydration, then expose screens appropriate to local login state. */
function Routes() {
  const { username, ready, storageError, hydrate } = usePlayer();
  if (!ready) return <Screen style={{ justifyContent: 'center' }}><Text style={ui.heading}>Froggy Crosser</Text>
    {storageError ? <><Text style={ui.error}>{storageError}</Text><Button title="Retry" onPress={() => void hydrate()} /></> : <ActivityIndicator color={colors.deep} />}</Screen>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
    {/* Login/logout changes username, which changes the available screens. */}
    <Stack.Protected guard={!username}><Stack.Screen name="login" /></Stack.Protected>
    <Stack.Protected guard={!!username}>
      <Stack.Screen name="(menu)" /><Stack.Screen name="game" options={{ gestureEnabled: false }} /><Stack.Screen name="result" options={{ gestureEnabled: false }} />
    </Stack.Protected>
  </Stack>;
}
/** Load the font and mount gesture support and player state above every route. */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Pixel: require('../../assets/fonts/VT323-Regular.ttf') });
  // Continue after a font error rather than leaving the startup indicator visible forever.
  if (!fontsLoaded && !fontError) return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.bg }} color={colors.deep} />;
  return <GestureHandlerRootView style={{ flex: 1 }}><PlayerProvider><StatusBar style="dark" /><Routes /></PlayerProvider></GestureHandlerRootView>;
}
