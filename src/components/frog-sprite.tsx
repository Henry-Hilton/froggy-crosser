import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image, type ImageProps } from 'expo-image';
import type { Direction } from '@/game/engine';
import { frogFrames } from '@/constants/frog-frames';

// The sheet has actual directional poses; never rotate the frog's side view.
export function FrogSprite({ direction = 'down', frame = 0, hopping = false, ...props }: ImageProps & {
  direction?: Direction; frame?: number; hopping?: boolean;
}) {
  const frames = frogFrames[direction][hopping ? 'hop' : 'idle'];
  return <Image {...props} source={frames[Math.max(0, frame) % frames.length]} contentFit="contain" transition={0} />;
}
export function IdleFrog(props: ImageProps) {
  const [frame, setFrame] = useState(0);
  useFocusEffect(useCallback(() => {
    const timer = setInterval(() => setFrame(value => (value + 1) % 3), 280);
    return () => clearInterval(timer);
  }, []));
  return <FrogSprite {...props} frame={frame} />;
}
