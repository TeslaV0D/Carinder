import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session-provider';

/** Passwordless login: Supabase mails a 6-digit code, which the user types in here. */
export default function LoginScreen() {
  const theme = useTheme();
  const { sendLoginCode, verifyLoginCode } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
          <ThemedText type="title" style={styles.center}>
            Carinder
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            Swipe dich zu deinem nächsten Auto.
          </ThemedText>

          <TextInput
            value={email}
            onChangeText={setEmail}
            editable={!codeSent}
            placeholder="E-Mail-Adresse"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={inputStyle}
          />

          {codeSent ? (
            <>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Code aus der E-Mail"
                placeholderTextColor={theme.textSecondary}
                autoComplete="one-time-code"
                keyboardType="number-pad"
                maxLength={6}
                style={inputStyle}
              />
              <PrimaryButton
                title="Anmelden"
                loading={busy}
                disabled={code.trim().length < 6}
                onPress={() => run(() => verifyLoginCode(email.trim(), code.trim()))}
              />
              <PrimaryButton
                title="Andere E-Mail verwenden"
                variant="outline"
                onPress={() => {
                  setCodeSent(false);
                  setCode('');
                }}
              />
            </>
          ) : (
            <PrimaryButton
              title="Code per E-Mail senden"
              loading={busy}
              disabled={!email.includes('@')}
              onPress={() =>
                run(async () => {
                  await sendLoginCode(email.trim());
                  setCodeSent(true);
                })
              }
            />
          )}

          {error && (
            <ThemedText type="small" style={[styles.center, { color: theme.nope }]}>
              {error}
            </ThemedText>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
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
    paddingHorizontal: Spacing.four,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  input: {
    minHeight: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
