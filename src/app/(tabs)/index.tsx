import { router } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { RoundButton } from '@/components/round-button';
import { SwipeDeck, type SwipeDeckHandle } from '@/components/swipe-deck';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import type { Vehicle } from '@/domain/vehicle';
import { useFeedEpoch, usePreferences } from '@/hooks/use-preferences';
import { useSwipeFeed } from '@/hooks/use-swipe-feed';
import { useTheme } from '@/hooks/use-theme';

export default function SwipeScreen() {
  const { data: preferences } = usePreferences();
  const epoch = useFeedEpoch();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="subtitle" style={styles.brand}>
          Carinder
        </ThemedText>
        {preferences ? (
          // Start a fresh deck whenever the filters change.
          <SwipeSession key={`${epoch}:${JSON.stringify(preferences)}`} />
        ) : (
          <Centered>
            <ActivityIndicator />
          </Centered>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function SwipeSession() {
  const theme = useTheme();
  const deck = useRef<SwipeDeckHandle>(null);
  const { vehicles, swipe, retry, error, isLoading, isExhausted } = useSwipeFeed();

  const openDetails = (vehicle: Vehicle) =>
    router.push({ pathname: '/vehicle/[id]', params: { id: vehicle.id } });

  if (error) {
    return (
      <Centered>
        <ThemedText type="smallBold">Da ist was schiefgelaufen.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {error.message}
        </ThemedText>
        <PrimaryButton title="Nochmal versuchen" onPress={retry} />
      </Centered>
    );
  }

  if (isExhausted) {
    return (
      <Centered>
        <ThemedText type="smallBold">Keine Autos mehr für deine Filter.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Lockere die Filter oder setze deine Swipes im Profil zurück.
        </ThemedText>
        <PrimaryButton title="Filter anpassen" onPress={() => router.navigate('/profile')} />
      </Centered>
    );
  }

  if (isLoading) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  return (
    <View style={styles.session}>
      <View style={styles.deck}>
        <SwipeDeck ref={deck} vehicles={vehicles} onSwipe={swipe} onOpen={openDetails} />
      </View>
      <View style={styles.actions}>
        <RoundButton
          label="✕"
          accessibilityLabel="Nope"
          color={theme.nope}
          onPress={() => deck.current?.swipe('dislike')}
        />
        <RoundButton
          label="★"
          accessibilityLabel="Superlike"
          color={theme.superlike}
          size={52}
          onPress={() => deck.current?.swipe('superlike')}
        />
        <RoundButton
          label="♥"
          accessibilityLabel="Like"
          color={theme.like}
          onPress={() => deck.current?.swipe('like')}
        />
      </View>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingTop: TopTabInset,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  brand: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  session: {
    flex: 1,
    gap: Spacing.four,
  },
  deck: {
    flex: 1,
    // Leaves room for the stacked cards peeking out below the top card.
    marginBottom: Spacing.five,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.five,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
});
