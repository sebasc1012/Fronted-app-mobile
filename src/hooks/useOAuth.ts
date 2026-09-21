import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export function useOAuth() {
  const router = useRouter();
  const { signInWithOAuth } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "apple" | "facebook") => {
    setOauthError(null);
    setOauthLoading(true);
    const { error, needsEmailConfirmation } = await signInWithOAuth(provider);
    setOauthLoading(false);

    if (error) {
      setOauthError(error);
      return;
    }

    if (needsEmailConfirmation) {
      router.push("/(auth)/verify-email");
    }
  };

  return { handleOAuth, oauthLoading, oauthError };
}
