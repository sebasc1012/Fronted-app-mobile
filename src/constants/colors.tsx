import { createContext, useContext, type ReactNode } from "react";
import { View, useColorScheme } from "react-native";
import { vars } from "nativewind";
import { usePreferences } from "../../lib/preferences";
import tokens from "./colors.json";

// Única fuente de color de la app (HU-05b): colors.json, con 4 paletas (claro, oscuro y
// sus versiones de alto contraste, HU-07). Las clases (`bg-surface`, `text-text-muted`…)
// leen variables CSS; este archivo da los valores crudos (íconos, tintColor, SVG) y
// aplica la paleta activa a las variables con <ColorScope>.

export type ColorScheme = "light" | "dark";
export type Palette = typeof tokens.light;

export const palettes = tokens;

export function resolvePalette(scheme: ColorScheme, highContrast: boolean): Palette {
  if (highContrast) return scheme === "dark" ? tokens.darkHC : tokens.lightHC;
  return scheme === "dark" ? tokens.dark : tokens.light;
}

// Luminancia relativa y relación de contraste de WCAG 2.x (de 1 a 21).
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const toVars = (palette: Palette) =>
  vars(
    Object.fromEntries(
      Object.entries(palette).map(([name, hex]) => [
        `--color-${name}`,
        [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" "),
      ]),
    ),
  );

const ScopeScheme = createContext<ColorScheme | null>(null);

// Aplica a su subárbol la paleta activa (tema × alto contraste) como variables CSS.
// `forceScheme="light"`: las pantallas de auth tienen diseño claro fijo en ambos temas.
export function ColorScope({ forceScheme, children }: { forceScheme?: ColorScheme; children: ReactNode }) {
  const system = useColorScheme();
  const parent = useContext(ScopeScheme);
  const { highContrast } = usePreferences();
  const scheme = forceScheme ?? parent ?? (system === "dark" ? "dark" : "light");

  return (
    <ScopeScheme.Provider value={scheme}>
      <View style={[{ flex: 1 }, toVars(resolvePalette(scheme, highContrast))]}>{children}</View>
    </ScopeScheme.Provider>
  );
}

export function useColors(): Palette {
  const system = useColorScheme();
  const scoped = useContext(ScopeScheme);
  const { highContrast } = usePreferences();
  return resolvePalette(scoped ?? (system === "dark" ? "dark" : "light"), highContrast);
}

// HU-07: con alto contraste, botones, campos, selectores y grupos de filas llevan borde visible.
export function useHighContrastBorder() {
  return usePreferences().highContrast ? "border-2 border-border" : "";
}
