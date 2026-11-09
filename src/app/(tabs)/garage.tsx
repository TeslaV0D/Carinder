import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehiclePhoto } from '@/components/vehicle-photo';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { queryKeys } from '@/data/query-keys';
import type { LikedVehicle } from '@/data/repository';
import { formatMileage, formatPrice, vehicleTitle } from '@/domain/format';
import { formatGarageShareText } from '@/domain/garage-share';
import { useTheme } from '@/hooks/use-theme';
import { useRepository } from '@/providers/repository-provider';

export default function GarageScreen() {
  const repository = useRepository();
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: queryKeys.liked,
    queryFn: () => repository.getLiked(),
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Deine Garage</ThemedText>
          {data && data.length > 0 && <ShareButton liked={data} />}
        </View>
        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.vehicle.id}
            renderItem={({ item }) => <GarageRow item={item} />}
            onRefresh={refetch}
            refreshing={isRefetching}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {error
                  ? `Konnte deine Garage nicht laden: ${error.message}`
                  : 'Noch leer. Swipe nach rechts, um Autos hier zu parken.'}
              </ThemedText>
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ShareButton({ liked }: { liked: LikedVehicle[] }) {
  const theme = useTheme();
  const share = () =>
    Share.share({
      message: formatGarageShareText(
        liked.map((entry) => ({ vehicle: entry.vehicle, superlike: entry.direction === 'superlike' })),
      ),
    });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={share}
      style={({ pressed }) => [styles.shareButton, { borderColor: theme.accent }, pressed && styles.pressed]}>
      <ThemedText type="smallBold" style={{ color: theme.accent }}>
        Teilen
      </ThemedText>
    </Pressable>
  );
}

function GarageRow({ item }: { item: LikedVehicle }) {
  const theme = useTheme();
  const { vehicle } = item;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/vehicle/[id]', params: { id: vehicle.id, liked: '1' } })}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.thumbnail}>
          <VehiclePhoto vehicle={vehicle} compact />
        </View>
        <View style={styles.rowText}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {item.direction === 'superlike' ? '★ ' : ''}
            {vehicleTitle(vehicle)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {vehicle.year} · {formatMileage(vehicle.mileageKm)}
            {vehicle.city ? ` · ${vehicle.city}` : ''}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {formatPrice(vehicle.priceEur)}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  shareButton: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  loading: {
    marginTop: Spacing.five,
  },
  list: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Spacing.three,
  },
  thumbnail: {
    width: 72,
    height: 56,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
