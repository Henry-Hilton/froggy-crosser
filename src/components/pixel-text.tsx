import { Text, StyleSheet, type TextProps } from 'react-native';

/** Apply the pixel font, enlarge text for readability, and prevent negative letter spacing. */
export function PixelText({ style, ...props }: TextProps) {
  // Flatten style arrays before deriving sizes; the final font overrides intentionally win.
  const resolved = StyleSheet.flatten(style);
  return <Text {...props} style={[style, {
    fontFamily: 'Pixel', fontWeight: '400',
    fontSize: Math.max(16, (resolved?.fontSize ?? 16) * 1.15),
    letterSpacing: Math.max(0, resolved?.letterSpacing ?? 0),
  }]} />;
}
