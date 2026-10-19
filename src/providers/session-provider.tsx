import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';

interface SessionContextValue {
  /** `demo` when no Supabase project is configured. */
  mode: 'demo' | 'supabase';
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  sendLoginCode(email: string): Promise<void>;
  verifyLoginCode(email: string, code: string): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function requireClient() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.');
  return supabase;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const mode = supabase ? 'supabase' : 'demo';
  const value: SessionContextValue = {
    mode,
    session,
    isLoading,
    isSignedIn: mode === 'demo' || session !== null,
    async sendLoginCode(email) {
      const { error } = await requireClient().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
    },
    async verifyLoginCode(email, code) {
      const { error } = await requireClient().auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await requireClient().auth.signOut();
      if (error) throw error;
    },
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}
