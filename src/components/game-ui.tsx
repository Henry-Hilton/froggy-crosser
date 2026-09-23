import { PixelText as Text } from '@/components/pixel-text';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors } from '@/constants/game-theme';
import { PixelSurface } from '@/components/pixel-panel';
import { IdleFrog } from '@/components/frog-sprite';
export { PixelPanel } from '@/components/pixel-panel';

export const art = {
  frog: require('../../assets/game/pixel/portrait-green.png'),
  car: require('../../assets/game/pixel/car.png'),
  truck: require('../../assets/game/pixel/truck.png'),
  racer: require('../../assets/game/pixel/racer.png'),
  log: require('../../assets/game/pixel/log.png'),
  gift: require('../../assets/game/pixel/gift.png'),
  pond: require('../../assets/game/pixel/hero.png'),
  grass: require('../../assets/game/pixel/grass.png'),
  water: require('../../assets/game/pixel/water.png'),
  road: require('../../assets/game/pixel/road.png'),
  roadStripe: require('../../assets/game/pixel/roadStripe.png'),
  shoreTop: require('../../assets/game/pixel/shoreTop.png'),
  shoreBottom: require('../../assets/game/pixel/shoreBottom.png'),
  tree: require('../../assets/game/pixel/tree.png'),
  tree2: require('../../assets/game/pixel/tree2.png'),
  medals: [require('../../assets/game/pixel/portrait-green.png'), require('../../assets/game/pixel/portrait-blue.png'), require('../../assets/game/pixel/portrait-brown.png')],
};
export function Button({ title, onPress, secondary = false, disabled = false, compact = false, playIcon = false }: {
  title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; compact?: boolean; playIcon?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [ui.button, compact && { paddingVertical: 12 }, pressed && { transform: [{ translateY: 2 }] }, disabled && { opacity: 0.45 }]}>
    {({ pressed }) => <><PixelSurface skin={secondary ? pressed ? 'greyPressed' : 'grey' : pressed ? 'greenPressed' : 'green'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Text style={ui.buttonText}>{title}</Text>{playIcon && <Image source={require('../../assets/game/ui/play.png')} contentFit="contain" style={{ width: 20, height: 20 }} />}</View></>}
  </Pressable>;
}
export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <SafeAreaView style={ui.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.screen, style]}>{children}</ScrollView></SafeAreaView>;
}
export function Eyebrow({ children }: PropsWithChildren) { return <Text style={ui.eyebrow}>{children}</Text>; }
export function FadeIn({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(value, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' });
    animation.start(); return () => animation.stop();
  }, [value]);
  return <Animated.View style={[style, { opacity: value, transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>{children}</Animated.View>;
}
export function PondHero({ small = false }: { small?: boolean }) {
  const [bob] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -7, duration: 1400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(bob, { toValue: 0, duration: 1400, useNativeDriver: Platform.OS !== 'web' }),
    ]));
    animation.start(); return () => animation.stop();
  }, [bob]);
  return <View style={{ height: small ? 160 : 200, alignItems: 'center', justifyContent: 'flex-end', width: '100%', overflow: 'hidden', borderRadius: 6, borderWidth: 2, borderColor: '#24394A' }}>
    <Image source={art.pond} style={{ width: '100%', height: '100%', position: 'absolute' }} contentFit="cover" />
    <Animated.View style={{ transform: [{ translateY: bob }], marginBottom: 2 }}><IdleFrog style={{ width: small ? 90 : 112, height: small ? 75 : 94 }} /></Animated.View>
  </View>;
}
export function RankPortrait({ rank }: { rank: number }) {
  return <View accessibilityLabel={`Rank ${rank}`} style={{ width: 60, height: 72, alignItems: 'center', justifyContent: 'center' }}>
    <Image source={art.medals[rank - 1]} style={{ width: 60, height: 50 }} contentFit="contain" />
    <Text style={{ color: colors.ink, fontWeight: '900', fontSize: 16 }}>#{rank}</Text>
  </View>;
}
export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flexGrow: 1, padding: 24, gap: 20, width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { fontSize: 42, fontWeight: '900', color: colors.ink, letterSpacing: -1.8, lineHeight: 46 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2.3, color: colors.muted, textTransform: 'uppercase' },
  button: { paddingVertical: 18, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  secondary: { backgroundColor: 'transparent', borderColor: colors.line, borderWidth: 1.5 },
  buttonText: { color: '#173314', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: 6, padding: 20, borderWidth: 2, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
});
