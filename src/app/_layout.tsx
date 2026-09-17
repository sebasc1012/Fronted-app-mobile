import "../../global.css";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { session, isLoading, isAuthorzed } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthorzed}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthorzed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );

}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <RootNavigation />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
