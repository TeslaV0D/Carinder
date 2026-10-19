import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface Props {
  label: string;
  accessibilityLabel: string;
  color: string;
  size?: number;
  onPress(): void;
}

export function RoundButton({ label, accessibilityLabel, color, size = 64, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          backgroundColor: theme.background,
          shadowColor: theme.cardShadow,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, { color, fontSize: size * 0.42 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  label: {
    fontWeight: 700,
  },
});
