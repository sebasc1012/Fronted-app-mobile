import { Redirect, Stack, usePathname } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";

// Sin esto, expo-router no sabe qué pantalla mostrar cuando el guard
// del root layout activa este grupo sin un path específico (no hay index.tsx).
export const unstable_settings = {
  initialRouteName: "login",
};

export default function AuthLayout() {
  const { session } = useAuth();
  const pathname = usePathname();

  // El root layout solo deja pasar a este grupo si falta sesión u onboarding.
  // Con sesión, lo que falta es onboarding. Se excluye la propia ruta de
  // onBoarding para no redirigir contra sí misma en cada render (loop infinito).
  if (session && pathname !== "/onBoarding") {
    return <Redirect href="/(auth)/onBoarding" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
