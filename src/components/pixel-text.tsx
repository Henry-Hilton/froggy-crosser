import { Text, StyleSheet, type TextProps } from 'react-native';

export function PixelText({ style, ...props }: TextProps) {
  const resolved = StyleSheet.flatten(style);
  return <Text {...props} style={[style, {
    fontFamily: 'Pixel', fontWeight: '400',
    fontSize: Math.max(16, (resolved?.fontSize ?? 16) * 1.15),
    letterSpacing: Math.max(0, resolved?.letterSpacing ?? 0),
  }]} />;
}
