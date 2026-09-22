import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { OAuthProvider } from "../../lib/auth/oauth";

export function useOAuth() {
  const { signInWithOAuth } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    console.log('[DEBUG][useOAuth] handleOAuth() tapped, provider =', provider);
    setOauthError(null);
    setOauthLoading(true);
    const { error, cancelled } = await signInWithOAuth(provider);
    console.log('[DEBUG][useOAuth] signInWithOAuth() returned:', { error, cancelled });
    setOauthLoading(false);

    if (error) {
      console.log('[DEBUG][useOAuth] setting oauthError');
      setOauthError(error);
      return;
    }
    if (cancelled) {
      console.log('[DEBUG][useOAuth] user cancelled, nothing to do');
      return;
    }
    // Éxito: la sesión ya quedó puesta en Supabase. El guard de rutas del
    // root (Stack.Protected) reacciona solo al cambio de session/profile,
    // igual que el login por email — no hace falta navegar aquí.
    console.log('[DEBUG][useOAuth] success — expecting root guard to redirect');
  };

  return { handleOAuth, oauthLoading, oauthError };
}
