import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Image } from 'expo-image';
import { AUTH_STORAGE_KEY, supabase } from '../lib/supabase';
import { queryClient } from '../lib/queryClient';
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

// Borra del teléfono todo dato del usuario: caché de queries, caché de imágenes
// y AsyncStorage, salvo las preferencias del dispositivo (`pref.*`).
export async function clearUserData() {
  queryClient.clear();
  const results = await Promise.allSettled([
    Image.clearMemoryCache(),
    Image.clearDiskCache(),
    AsyncStorage.getAllKeys().then((keys) =>
      AsyncStorage.removeMany(keys.filter((key) => !key.startsWith('pref.'))),
    ),
  ]);
  results
    .filter((result) => result.status === 'rejected')
    .forEach((result) => console.warn('[auth] clearUserData:', (result as PromiseRejectedResult).reason));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Todo cierre de sesión (botón, 401 en useProfile, refresh inválido) pasa por
    // SIGNED_OUT: ahí se limpian los datos para que el siguiente usuario no vea nada.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') void clearUserData();
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

  // Una sola ejecución a la vez: un doble toque reutiliza la misma promesa.
  const signingOut = useRef<Promise<void> | null>(null);

  const signOut = () => {
    signingOut.current ??= (async () => {
      try {
        // Solo este dispositivo; los demás conservan su sesión.
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (!error) return;
        console.warn('[auth] signOut:', error);
      } catch (error) {
        console.warn('[auth] signOut lanzó:', error);
      }
      // supabase-js no siempre borra la sesión local cuando falla (p. ej. sin red y
      // con el token vencido): se fuerza, sin mostrar error al usuario.
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY).catch((error) =>
        console.warn('[auth] no se pudo borrar la sesión local:', error),
      );
      setSession(null);
      await clearUserData();
    })().finally(() => {
      signingOut.current = null;
    });
    return signingOut.current;
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