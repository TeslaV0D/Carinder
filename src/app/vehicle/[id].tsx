import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehiclePhoto } from '@/components/vehicle-photo';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { queryKeys } from '@/data/query-keys';
import { formatMileage, formatPower, formatPrice, sourceLinkLabel, vehicleTitle } from '@/domain/format';
import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from '@/domain/vehicle';
import { useTheme } from '@/hooks/use-theme';
import { useRepository } from '@/providers/repository-provider';

export default function VehicleDetailScreen() {
  const { id, liked } = useLocalSearchParams<{ id: string; liked?: string }>();
  const repository = useRepository();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: queryKeys.vehicle(id),
    queryFn: () => repository.getVehicle(id),
  });

  const remove = useMutation({
    mutationFn: () => repository.removeSwipe(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.liked });
      router.back();
    },
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!vehicle) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Dieses Auto gibt es nicht mehr.</ThemedText>
      </ThemedView>
    );
  }

  const { sourceUrl } = vehicle;
  const specs: [string, string][] = [
    ['Baujahr', String(vehicle.year)],
    ['Kilometerstand', formatMileage(vehicle.mileageKm)],
    ['Leistung', formatPower(vehicle.powerKw)],
    ['Kraftstoff', FUEL_LABELS[vehicle.fuel]],
    ['Getriebe', TRANSMISSION_LABELS[vehicle.transmission]],
    ['Karosserie', BODY_TYPE_LABELS[vehicle.bodyType]],
    ['Standort', [vehicle.zip, vehicle.city].filter(Boolean).join(' ') || '–'],
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photo}>
          <VehiclePhoto vehicle={vehicle} />
        </View>
        <View style={styles.body}>
          <View>
            <ThemedText type="subtitle">{vehicleTitle(vehicle)}</ThemedText>
            {vehicle.variant && <ThemedText themeColor="textSecondary">{vehicle.variant}</ThemedText>}
          </View>
          <ThemedText type="subtitle" style={{ color: theme.accent }}>
            {formatPrice(vehicle.priceEur)}
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.specs}>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  {label}
                </ThemedText>
                <ThemedText type="smallBold">{value}</ThemedText>
              </View>
            ))}
          </ThemedView>

          {sourceUrl ? (
            // openURL (not the in-app browser) so the link opens the mobile.de app when installed.
            <PrimaryButton title={sourceLinkLabel(vehicle)} onPress={() => Linking.openURL(sourceUrl)} />
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Demo-Fahrzeug: Es gibt kein echtes Inserat dazu.
            </ThemedText>
          )}
          {liked === '1' && (
            <PrimaryButton
              title="Aus Garage entfernen"
              variant="danger"
              loading={remove.isPending}
              onPress={() => remove.mutate()}
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.six,
  },
  photo: {
    height: 280,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  specs: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
