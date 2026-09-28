import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

// Clave `pref.*`: sobrevive al cerrar sesión (ver clearUserData en AuthContext).
const THEME_KEY = "pref.theme";

let preference: ThemePreference = "system";
export const getThemePreference = () => preference;

// Cambia el tema de toda la app: useColorScheme, clases `dark:` de NativeWind, tab bar,
// alertas y barras del sistema. "unspecified" devuelve el control al sistema (RN ≥ 0.82).
function apply(next: ThemePreference) {
  Appearance.setColorScheme(next === "system" ? "unspecified" : next);
}

// Al arrancar, antes de ocultar el splash: aplica la preferencia guardada (o "system").
export async function applyStoredTheme() {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") preference = stored;
  } catch (error) {
    console.warn("[theme] no se pudo leer el tema guardado:", error);
  }
  apply(preference);
}

export async function setThemePreference(next: ThemePreference) {
  preference = next;
  apply(next);
  await AsyncStorage.setItem(THEME_KEY, next).catch((error) =>
    console.warn("[theme] no se pudo guardar el tema:", error),
  );
}
