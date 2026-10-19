import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BODY_TYPE_LABELS, type BodyType, type Vehicle } from '@/domain/vehicle';

const BODY_TYPE_EMOJI: Record<BodyType, string> = {
  small: '🚗',
  sedan: '🚘',
  estate: '🚙',
  suv: '🚙',
  coupe: '🏎️',
  convertible: '🏎️',
  van: '🚐',
};

const PLACEHOLDER_COLORS = ['#3D5A80', '#6D597A', '#2A9D8F', '#B56576', '#E76F51', '#457B9D', '#5F0F40', '#264653'];

function colorFor(make: string): string {
  let hash = 0;
  for (const char of make) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
}

interface Props {
  vehicle: Vehicle;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

/** First listing photo, or a generated placeholder for vehicles without photos (demo data). */
export function VehiclePhoto({ vehicle, style, compact = false }: Props) {
  const [photo] = vehicle.images;

  return (
    <View style={[styles.fill, style]}>
      {photo ? (
        <Image source={photo} style={styles.fill} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.fill, styles.placeholder, { backgroundColor: colorFor(vehicle.make) }]}>
          <Text style={compact ? styles.emojiCompact : styles.emoji}>{BODY_TYPE_EMOJI[vehicle.bodyType]}</Text>
          {!compact && (
            <>
              <Text style={styles.make}>{vehicle.make}</Text>
              <Text style={styles.body}>{BODY_TYPE_LABELS[vehicle.bodyType]} · Demo-Fahrzeug, kein Foto</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 96,
  },
  emojiCompact: {
    fontSize: 32,
  },
  make: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: {
    color: '#ffffffcc',
    fontSize: 14,
    fontWeight: 500,
  },
});
