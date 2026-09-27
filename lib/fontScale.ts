import { useSyncExternalStore } from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FontScaleLevel = "small" | "normal" | "large" | "xlarge";

export const FONT_SCALES: Record<FontScaleLevel, number> = { small: 0.85, normal: 1, large: 1.15, xlarge: 1.3 };

// Tope total (sistema × app) respecto al tamaño base del diseño. Ajustable por el PO.
export const MAX_TOTAL_SCALE = 2;

// Tamaño por defecto de RN cuando el estilo no define fontSize.
const DEFAULT_FONT_SIZE = 14;

// Clave `pref.*`: sobrevive al cerrar sesión (ver clearUserData en AuthContext).
const FONT_SCALE_KEY = "pref.fontScale";

// Store de módulo: los textos se suscriben con useSyncExternalStore y se vuelven a
// renderizar al cambiar el nivel, sin provider.
let level: FontScaleLevel = "normal";
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getFontScaleLevel = () => level;

export function useFontScale() {
  const current = useSyncExternalStore(subscribe, getFontScaleLevel);
  return { level: current, multiplier: FONT_SCALES[current] };
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

// Al arrancar, antes de ocultar el splash: aplica el nivel guardado (o "normal").
export async function applyStoredFontScale() {
  try {
    const stored = await AsyncStorage.getItem(FONT_SCALE_KEY);
    if (stored && stored in FONT_SCALES) setLevel(stored as FontScaleLevel);
  } catch (error) {
    console.warn("[fontScale] no se pudo leer el tamaño guardado:", error);
  }
}

function setLevel(next: FontScaleLevel) {
  level = next;
  listeners.forEach((listener) => listener());
}

export async function setFontScaleLevel(next: FontScaleLevel) {
  setLevel(next);
  await AsyncStorage.setItem(FONT_SCALE_KEY, next).catch((error) =>
    console.warn("[fontScale] no se pudo guardar el tamaño:", error),
  );
}
