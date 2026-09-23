import { memo, type PropsWithChildren } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { uiSkins } from '@/constants/ui-skins';

// Nine separate regions keep corner pixels square on every platform and panel size.
export const PixelSurface = memo(function PixelSurface({ skin = 'panel' }: { skin?: keyof typeof uiSkins }) {
  return <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
    {[0, 1, 2].map(row => <View key={row} style={{ flexDirection: 'row', ...(row === 1 ? { flex: 1 } : { height: 8 }) }}>
      {[0, 1, 2].map(column => <Image key={column} source={uiSkins[skin][row * 3 + column]} contentFit="fill"
        transition={0} style={{ height: '100%', ...(column === 1 ? { flex: 1 } : { width: 8 }) }} />)}
    </View>)}
  </View>;
});

export function PixelPanel({ children, style, skin = 'panel', ...props }: PropsWithChildren<ViewProps & { skin?: keyof typeof uiSkins }>) {
  return <View {...props} style={[{ padding: 20, minHeight: 24, minWidth: 24 }, style]}>
    <PixelSurface skin={skin} />{children}
  </View>;
}
