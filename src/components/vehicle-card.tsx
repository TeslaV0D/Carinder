import { StyleSheet, View } from 'react-native';

import { SpecChip } from '@/components/spec-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehiclePhoto } from '@/components/vehicle-photo';
import { Spacing } from '@/constants/theme';
import { formatMileage, formatPower, formatPrice, vehicleTitle } from '@/domain/format';
import { FUEL_LABELS, TRANSMISSION_LABELS, type Vehicle } from '@/domain/vehicle';
import { useTheme } from '@/hooks/use-theme';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.card, { shadowColor: theme.cardShadow }]}>
      <View style={styles.photo}>
        <VehiclePhoto vehicle={vehicle} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
              {vehicleTitle(vehicle)}
            </ThemedText>
            {vehicle.variant && (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {vehicle.variant}
              </ThemedText>
            )}
          </View>
          <ThemedText type="smallBold" style={[styles.price, { color: theme.accent }]}>
            {formatPrice(vehicle.priceEur)}
          </ThemedText>
        </View>
        <View style={styles.chips}>
          <SpecChip label={String(vehicle.year)} />
          <SpecChip label={formatMileage(vehicle.mileageKm)} />
          <SpecChip label={formatPower(vehicle.powerKw)} />
          <SpecChip label={FUEL_LABELS[vehicle.fuel]} />
          <SpecChip label={TRANSMISSION_LABELS[vehicle.transmission]} />
        </View>
        {vehicle.city && (
          <ThemedText type="small" themeColor="textSecondary">
            📍 {vehicle.city}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  photo: {
    flex: 1,
  },
  info: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  price: {
    fontSize: 22,
    lineHeight: 28,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
