import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

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
    const { data } = await api.get<Profile>("/users/profile");
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
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
