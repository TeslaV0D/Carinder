import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  title: string;
  onPress(): void;
  variant?: 'filled' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ title, onPress, variant = 'filled', disabled = false, loading = false }: Props) {
  const theme = useTheme();
  const color = variant === 'danger' ? theme.nope : theme.accent;
  const filled = variant === 'filled';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: color, backgroundColor: filled ? color : 'transparent' },
        (pressed || disabled) && styles.dimmed,
      ]}>
      {loading ? (
        <ActivityIndicator color={filled ? '#ffffff' : color} />
      ) : (
        <ThemedText type="smallBold" style={{ color: filled ? '#ffffff' : color }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  dimmed: {
    opacity: 0.6,
  },
});
