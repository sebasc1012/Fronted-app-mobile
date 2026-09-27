import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../contexts/AuthContext";
import { ForceLightScheme } from "../../constants/colors";

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

  // Caso simétrico: cerrar sesión desde onBoarding limpia `session`, pero
  // eso no cambia `isAuthorized` en el root (ya era false por onboarding
  // incompleto), así que Stack.Protected no remonta nada y nadie más saca
  // de esta pantalla. Sin esto, onBoarding.tsx necesitaba su propio
  // router.replace manual, que competía con este guard y producía
  // "Maximum update depth exceeded" en la segunda vuelta del ciclo.
  if (!session && pathname === "/onBoarding") {
    return <Redirect href="/(auth)/login" />;
  }

  // Las pantallas de auth tienen diseño claro fijo (beige + glass): tokens claros y barra
  // de estado oscura aunque el tema sea oscuro (sobrescribe el `style="auto"` del root).
  return (
    <ForceLightScheme>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </ForceLightScheme>
  );
}
