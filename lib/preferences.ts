import { useSyncExternalStore } from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FontScaleLevel = "small" | "normal" | "large" | "xlarge";

export const FONT_SCALES: Record<FontScaleLevel, number> = { small: 0.85, normal: 1, large: 1.15, xlarge: 1.3 };

// Tope total (sistema × app) respecto al tamaño base del diseño. Ajustable por el PO.
export const MAX_TOTAL_SCALE = 2;

// Tamaño por defecto de RN cuando el estilo no define fontSize.
const DEFAULT_FONT_SIZE = 14;

// Claves `pref.*`: sobreviven al cerrar sesión (ver clearUserData en AuthContext).
const FONT_SCALE_KEY = "pref.fontScale";
const HIGH_CONTRAST_KEY = "pref.highContrast";

// Preferencias de accesibilidad (HU-06, HU-07) en un store de módulo: los componentes se
// suscriben con useSyncExternalStore y se vuelven a renderizar al cambiar, sin provider.
type Preferences = { fontScale: FontScaleLevel; highContrast: boolean };
let preferences: Preferences = { fontScale: "normal", highContrast: false };
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getPreferences = () => preferences;
export const getFontScaleLevel = () => preferences.fontScale;

function update(next: Partial<Preferences>) {
  preferences = { ...preferences, ...next };
  listeners.forEach((listener) => listener());
}

export const usePreferences = () => useSyncExternalStore(subscribe, getPreferences);

export function useFontScale() {
  const { fontScale } = usePreferences();
  return { level: fontScale, multiplier: FONT_SCALES[fontScale] };
}

// fontSize y lineHeight × nivel de la app. RN ya escala por el tamaño del sistema;
// maxFontSizeMultiplier limita ese escalado para que sistema × app ≤ cap.
export function scaleFontStyle(style: StyleProp<TextStyle>, multiplier: number, cap = MAX_TOTAL_SCALE) {
  const { fontSize = DEFAULT_FONT_SIZE, lineHeight } = StyleSheet.flatten(style) ?? {};
  return {
    style: { fontSize: fontSize * multiplier, ...(lineHeight !== undefined && { lineHeight: lineHeight * multiplier }) },
    maxFontSizeMultiplier: cap / multiplier,
  };
}

// Al arrancar, antes de ocultar el splash: aplica lo guardado (o los valores por defecto).
export async function applyStoredPreferences() {
  try {
    const [fontScale, highContrast] = await Promise.all([
      AsyncStorage.getItem(FONT_SCALE_KEY),
      AsyncStorage.getItem(HIGH_CONTRAST_KEY),
    ]);
    update({
      ...(fontScale && fontScale in FONT_SCALES && { fontScale: fontScale as FontScaleLevel }),
      highContrast: highContrast === "true",
    });
  } catch (error) {
    console.warn("[preferences] no se pudieron leer las preferencias guardadas:", error);
  }
}

async function save(key: string, value: string) {
  await AsyncStorage.setItem(key, value).catch((error) =>
    console.warn(`[preferences] no se pudo guardar ${key}:`, error),
  );
}

export async function setFontScaleLevel(next: FontScaleLevel) {
  update({ fontScale: next });
  await save(FONT_SCALE_KEY, next);
}

export async function setHighContrast(next: boolean) {
  update({ highContrast: next });
  await save(HIGH_CONTRAST_KEY, String(next));
}
