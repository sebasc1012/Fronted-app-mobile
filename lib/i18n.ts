import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../src/locales/en.json";
import es from "../src/locales/es.json";

export type Language = "es" | "en";
export type LanguagePreference = "system" | Language;

// Clave `pref.*`: sobrevive al cerrar sesión (ver clearUserData en AuthContext).
const LANGUAGE_KEY = "pref.language";

const resources = { en: { translation: en }, es: { translation: es } };

// Cualquier variante de inglés → inglés; español o un idioma no soportado → español.
export function resolveLanguage(preference: LanguagePreference, deviceLanguageCode?: string | null): Language {
  if (preference !== "system") return preference;
  return deviceLanguageCode === "en" ? "en" : "es";
}

const deviceLanguageCode = () => getLocales()[0]?.languageCode;

let preference: LanguagePreference = "system";
export const getLanguagePreference = () => preference;

i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(preference, deviceLanguageCode()),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

// Al arrancar, antes de ocultar el splash: aplica la preferencia guardada (o "system").
export async function applyStoredLanguage() {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored === "es" || stored === "en") preference = stored;
  } catch (error) {
    console.warn("[i18n] no se pudo leer el idioma guardado:", error);
  }
  await i18n.changeLanguage(resolveLanguage(preference, deviceLanguageCode()));
}

export async function setLanguagePreference(next: LanguagePreference) {
  preference = next;
  await i18n.changeLanguage(resolveLanguage(next, deviceLanguageCode()));
  await AsyncStorage.setItem(LANGUAGE_KEY, next).catch((error) =>
    console.warn("[i18n] no se pudo guardar el idioma:", error),
  );
}

export default i18n;
