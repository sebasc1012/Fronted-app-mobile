import "../../global.css";
import { applyStoredLanguage } from "../../lib/i18n";
import { applyStoredTheme } from "../../lib/theme";
import { applyStoredPreferences } from "../../lib/preferences";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";
import { useProfile } from "../hooks/useProfile";
import { ColorScope } from "../constants/colors";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { session, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(!!session);
  // Idioma, tema y tamaño de texto guardados se aplican antes de ocultar el splash: sin parpadeo.
  const [prefsReady, setPrefsReady] = useState(false);
  const isReady = !authLoading && !profileLoading && prefsReady;

  useEffect(() => {
    Promise.all([applyStoredLanguage(), applyStoredTheme(), applyStoredPreferences()]).finally(() => setPrefsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  const isAuthorized = !!session && !!profile?.onboardingCompleted;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthorized}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthorized}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Root() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style="auto" />
          <ColorScope>
            <RootNavigation />
          </ColorScope>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
