import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authErrorKey } from '../lib/authErrors';
import { signInWithProvider, OAuthProvider } from '../lib/auth/oauth';
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signInWithOAuth: (
    provider: OAuthProvider,
  ) => Promise<{ error: string | null; cancelled?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? authErrorKey(error) : null };
  };

  const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  const needsEmailConfirmation = !error && !data.session;
  return { error: error ? authErrorKey(error) : null, needsEmailConfirmation };
};

  const signInWithOAuth = async (provider: OAuthProvider) => {
    console.log('[DEBUG][AuthContext] signInWithOAuth() called with provider =', provider);
    const result = await signInWithProvider(provider);
    console.log('[DEBUG][AuthContext] signInWithProvider() resolved:', result);

    if (result.status === 'error') {
      return { error: result.errorKey };
    }
    if (result.status === 'cancelled') {
      return { error: null, cancelled: true };
    }
    // 'success': exchangeCodeForSession ya dejó la sesión puesta; el listener
    // onAuthStateChange de arriba la recoge solo y el guard de rutas navega.
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isLoading, signIn, signUp, signInWithOAuth, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}