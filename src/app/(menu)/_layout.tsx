import { PixelText as Text } from '@/components/pixel-text';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Drawer, DrawerContentScrollView, DrawerItem, DrawerItemList, type DrawerContentComponentProps } from 'expo-router/drawer';
import { Image } from 'expo-image';
import { usePlayer } from '@/state/player-context';
import { art, PixelPanel, ui } from '@/components/game-ui';
import { colors } from '@/constants/game-theme';
function MenuContent(props: DrawerContentComponentProps) {
  const { username, logout } = usePlayer();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
    <PixelPanel style={{ padding: 24, gap: 12, margin: 12 }}>
      <Image source={art.frog} style={{ width: 74, height: 74 }} />
      <Text style={ui.eyebrow}>YOUR POND PASSPORT</Text><Text style={ui.heading}>{username}</Text>
      <Text style={ui.body}>Every great journey starts{'\n'}with one little hop.</Text>
    </PixelPanel>
    <DrawerItemList {...props} />
    <DrawerItem label={busy ? 'Logging out…' : 'Log Out'} labelStyle={{ color: colors.danger, fontFamily: 'Pixel', fontSize: 22 }} onPress={() => {
      if (busy) return; setBusy(true);
      void logout().catch(() => setError('Could not log out. Please retry.')).finally(() => setBusy(false));
    }} />
    {!!error && <Text style={[ui.error, { padding: 20 }]}>{error}</Text>}
    <Text style={[ui.eyebrow, { marginTop: 'auto', padding: 24 }]}>FROGGY CROSSER · STiMP</Text>
  </DrawerContentScrollView>;
}
export default function MenuLayout() {
  return <Drawer drawerContent={props => <MenuContent {...props} />} screenOptions={({ navigation }) => ({
    headerLeft: () => <Pressable accessibilityRole="button" accessibilityLabel="Show navigation menu" onPress={() => navigation.toggleDrawer()} style={{ width: 48, height: 48, marginLeft: 4, alignItems: 'center', justifyContent: 'center' }}><Image source={require('../../../assets/game/ui/hamburger.png')} contentFit="contain" style={{ width: 24, height: 24 }} /></Pressable>,
    headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerShadowVisible: false,
    headerTitleStyle: { fontFamily: 'Pixel', fontSize: 24, fontWeight: '400' }, drawerLabelStyle: { fontFamily: 'Pixel', fontSize: 22 }, drawerStyle: { backgroundColor: colors.bg },
    drawerActiveBackgroundColor: colors.green, drawerActiveTintColor: colors.ink, drawerInactiveTintColor: colors.muted,
  })}>
    <Drawer.Screen name="index" options={{ title: 'Froggy Crosser', drawerLabel: 'Main Menu' }} />
    <Drawer.Screen name="high-scores" options={{ title: 'Hall of Hoppers', drawerLabel: 'High Score' }} />
  </Drawer>;
}
