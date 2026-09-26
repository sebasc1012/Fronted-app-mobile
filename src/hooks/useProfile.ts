import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  fullName: string | null;
  gender: string | null;
  country: string | null;
  phone: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
};

async function fetchProfile(): Promise<Profile | null> {
  try {
    // El backend responde `{ profile }`, no el perfil plano.
    const { data } = await api.get<{ profile: Profile }>("/api/users/profile");
    return data.profile;
  } catch (error: any) {
    // 404 = profile doesn't exist yet (expected during onboarding)
    if (error?.response?.status === 404) return null;
    // 401 = token stale/invalid (leftover SecureStore session). Force logout
    // instead of treating it as "needs onboarding".
    if (error?.response?.status === 401) {
      await supabase.auth.signOut();
      return null;
    }
    throw error;
  }
}

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled,
  });
}
