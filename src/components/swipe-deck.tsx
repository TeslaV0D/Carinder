import { useImperativeHandle, useRef, type Ref } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useCompetingGestures, GestureDetector, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { VehicleCard } from '@/components/vehicle-card';
import { Spacing } from '@/constants/theme';
import type { SwipeDirection, Vehicle } from '@/domain/vehicle';
import { useTheme } from '@/hooks/use-theme';

/** Cards rendered at once; the rest of the queue waits off-screen. */
const VISIBLE_CARDS = 3;
const FLING_VELOCITY = 900;
const FLY_OUT_MS = 220;

export interface SwipeDeckHandle {
  /** Swipes the top card programmatically (used by the buttons below the deck). */
  swipe(direction: SwipeDirection): void;
}

interface SwipeDeckProps {
  vehicles: Vehicle[];
  onSwipe(vehicle: Vehicle, direction: SwipeDirection): void;
  onOpen(vehicle: Vehicle): void;
  ref?: Ref<SwipeDeckHandle>;
}

export function SwipeDeck({ vehicles, onSwipe, onOpen, ref }: SwipeDeckProps) {
  const topCard = useRef<SwipeDeckHandle>(null);
  useImperativeHandle(ref, () => ({ swipe: (direction) => topCard.current?.swipe(direction) }), []);

  return (
    <View style={styles.deck}>
      {vehicles
        .slice(0, VISIBLE_CARDS)
        .map((vehicle, depth) => (
          <SwipeableCard
            key={vehicle.id}
            ref={depth === 0 ? topCard : undefined}
            vehicle={vehicle}
            depth={depth}
            onSwiped={onSwipe}
            onOpen={onOpen}
          />
        ))
        .reverse()}
    </View>
  );
}

interface SwipeableCardProps {
  vehicle: Vehicle;
  /** 0 is the top card. */
  depth: number;
  onSwiped(vehicle: Vehicle, direction: SwipeDirection): void;
  onOpen(vehicle: Vehicle): void;
  ref?: Ref<SwipeDeckHandle>;
}

function SwipeableCard({ vehicle, depth, onSwiped, onOpen, ref }: SwipeableCardProps) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const threshold = width * 0.28;
  const isTop = depth === 0;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isLeaving = useSharedValue(false);

  const flyOut = (direction: SwipeDirection) => {
    'worklet';
    if (isLeaving.get()) return;
    isLeaving.set(true);
    const toX = direction === 'like' ? width * 1.5 : direction === 'dislike' ? -width * 1.5 : translateX.get();
    const toY = direction === 'superlike' ? -height * 1.2 : translateY.get();
    translateX.set(withTiming(toX, { duration: FLY_OUT_MS }));
    translateY.set(
      withTiming(toY, { duration: FLY_OUT_MS }, (finished) => {
        if (finished) scheduleOnRN(onSwiped, vehicle, direction);
      }),
    );
  };

  useImperativeHandle(ref, () => ({ swipe: flyOut }));

  const pan = usePanGesture({
    enabled: isTop,
    onUpdate: (event) => {
      'worklet';
      translateX.set(event.translationX);
      translateY.set(event.translationY);
    },
    onDeactivate: (event) => {
      'worklet';
      if (event.translationX > threshold || event.velocityX > FLING_VELOCITY) {
        flyOut('like');
      } else if (event.translationX < -threshold || event.velocityX < -FLING_VELOCITY) {
        flyOut('dislike');
      } else if (event.translationY < -threshold || event.velocityY < -FLING_VELOCITY) {
        flyOut('superlike');
      } else {
        translateX.set(withSpring(0));
        translateY.set(withSpring(0));
      }
    },
  });

  const tap = useTapGesture({
    enabled: isTop,
    onDeactivate: (event) => {
      'worklet';
      if (!event.canceled) scheduleOnRN(onOpen, vehicle);
    },
  });

  const gesture = useCompetingGestures(pan, tap);

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.get(), [-width, 0, width], [-14, 0, 14]);
    return {
      transform: [
        { translateX: translateX.get() },
        { translateY: translateY.get() + depth * Spacing.three },
        { rotate: `${rotate}deg` },
        { scale: 1 - depth * 0.04 },
      ],
    };
  });
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.get(), [0, threshold], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.get(), [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));
  const superStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.get(), [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, { zIndex: VISIBLE_CARDS - depth }, cardStyle]}
        pointerEvents={isTop ? 'auto' : 'none'}>
        <VehicleCard vehicle={vehicle} />
        <Animated.View style={[styles.stamp, styles.stampLeft, { borderColor: theme.like }, likeStyle]}>
          <Text style={[styles.stampText, { color: theme.like }]}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampRight, { borderColor: theme.nope }, nopeStyle]}>
          <Text style={[styles.stampText, { color: theme.nope }]}>NOPE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampCenter, { borderColor: theme.superlike }, superStyle]}>
          <Text style={[styles.stampText, { color: theme.superlike }]}>SUPER</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  deck: {
    flex: 1,
  },
  card: {
    ...StyleSheet.absoluteFill,
  },
  stamp: {
    position: 'absolute',
    top: Spacing.five,
    borderWidth: 4,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  stampLeft: {
    left: Spacing.four,
    transform: [{ rotate: '-15deg' }],
  },
  stampRight: {
    right: Spacing.four,
    transform: [{ rotate: '15deg' }],
  },
  stampCenter: {
    alignSelf: 'center',
    top: '40%',
  },
  stampText: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: 2,
  },
});
