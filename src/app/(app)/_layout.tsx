import { Redirect, Stack } from "expo-router";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../../contexts/AuthContext";

export default function AppLayout() {
  const { session, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(!!session);

  if (authLoading || (session && profileLoading)) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile && !profile.onboardingCompleted)
    return <Redirect href="/(auth)/onBoarding" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
