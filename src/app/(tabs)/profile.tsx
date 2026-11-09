import { useQueryClient } from '@tanstack/react-query';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { queryKeys } from '@/data/query-keys';
import { formatMileage, formatPrice } from '@/domain/format';
import type { Preferences } from '@/domain/preferences';
import { BODY_TYPES, BODY_TYPE_LABELS, FUELS, FUEL_LABELS } from '@/domain/vehicle';
import { usePreferences, useRestartFeed, useSavePreferences } from '@/hooks/use-preferences';
import { useTheme } from '@/hooks/use-theme';
import { useRepository } from '@/providers/repository-provider';
import { useSession } from '@/providers/session-provider';

const PRICE_OPTIONS = [null, 10_000, 20_000, 30_000, 50_000, 80_000];
const YEAR_OPTIONS = [null, 2012, 2016, 2019, 2022];
const MILEAGE_OPTIONS = [null, 50_000, 100_000, 150_000];

function toggle<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

export default function ProfileScreen() {
  const { mode, session, signOut } = useSession();
  const repository = useRepository();
  const queryClient = useQueryClient();
  const restartFeed = useRestartFeed();
  const { data: preferences } = usePreferences();
  const savePreferences = useSavePreferences();

  const update = (change: Partial<Preferences>) => {
    if (preferences) savePreferences.mutate({ ...preferences, ...change });
  };

  const confirmReset = () =>
    Alert.alert('Alle Swipes zurücksetzen?', 'Deine Garage wird geleert und alle Autos tauchen wieder auf.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Zurücksetzen',
        style: 'destructive',
        onPress: async () => {
          await repository.resetSwipes();
          await queryClient.invalidateQueries({ queryKey: queryKeys.liked });
          restartFeed();
        },
      },
    ]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Profil</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            {mode === 'demo' ? (
              <>
                <ThemedText type="smallBold">Demo-Modus</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Kein Konto nötig: Swipes und Filter bleiben auf diesem Gerät. Mit einem Supabase-Projekt
                  bekommst du ein echtes Konto (siehe README).
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText type="smallBold">Angemeldet als</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {session?.user.email}
                </ThemedText>
                <PrimaryButton title="Abmelden" variant="outline" onPress={signOut} />
              </>
            )}
          </ThemedView>

          {preferences && (
            <>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Filter
              </ThemedText>
              <OptionGroup
                title="Preis bis"
                options={PRICE_OPTIONS.map((value) => ({
                  label: value === null ? 'Egal' : formatPrice(value),
                  selected: preferences.maxPriceEur === value,
                  onPress: () => update({ maxPriceEur: value }),
                }))}
              />
              <OptionGroup
                title="Baujahr ab"
                options={YEAR_OPTIONS.map((value) => ({
                  label: value === null ? 'Egal' : String(value),
                  selected: preferences.minYear === value,
                  onPress: () => update({ minYear: value }),
                }))}
              />
              <OptionGroup
                title="Kilometerstand bis"
                options={MILEAGE_OPTIONS.map((value) => ({
                  label: value === null ? 'Egal' : formatMileage(value),
                  selected: preferences.maxMileageKm === value,
                  onPress: () => update({ maxMileageKm: value }),
                }))}
              />
              <OptionGroup
                title="Kraftstoff (leer = alle)"
                options={FUELS.map((fuel) => ({
                  label: FUEL_LABELS[fuel],
                  selected: preferences.fuels.includes(fuel),
                  onPress: () => update({ fuels: toggle(preferences.fuels, fuel) }),
                }))}
              />
              <OptionGroup
                title="Karosserie (leer = alle)"
                options={BODY_TYPES.map((bodyType) => ({
                  label: BODY_TYPE_LABELS[bodyType],
                  selected: preferences.bodyTypes.includes(bodyType),
                  onPress: () => update({ bodyTypes: toggle(preferences.bodyTypes, bodyType) }),
                }))}
              />
            </>
          )}

          <PrimaryButton title="Alle Swipes zurücksetzen" variant="danger" onPress={confirmReset} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

interface Option {
  label: string;
  selected: boolean;
  onPress(): void;
}

function OptionGroup({ title, options }: { title: string; options: Option[] }) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      <ThemedText type="small" themeColor="textSecondary">
        {title}
      </ThemedText>
      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: option.selected }}
            onPress={option.onPress}
            style={[
              styles.option,
              { borderColor: option.selected ? theme.accent : theme.backgroundSelected },
              option.selected && { backgroundColor: theme.accent },
            ]}>
            <ThemedText type="small" style={option.selected && styles.optionSelectedText}>
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
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
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.two,
    fontSize: 18,
  },
  group: {
    gap: Spacing.two,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  optionSelectedText: {
    color: '#ffffff',
  },
});
