import { createContext, useContext, type ReactNode } from "react";
import { View, useColorScheme } from "react-native";
import { vars } from "nativewind";
import tokens from "./colors.json";

// Única fuente de color de la app (HU-05b): colors.json. Las clases (`bg-surface`,
// `text-text-muted`…) la leen vía tailwind.config.js; este archivo da los valores crudos
// para lo que no acepta clases (íconos, tintColor, SVG).

export type ColorScheme = "light" | "dark";
export type Palette = typeof tokens.light & typeof tokens.brand;

export const palettes: Record<ColorScheme, Palette> = {
  light: { ...tokens.light, ...tokens.brand },
  dark: { ...tokens.dark, ...tokens.brand },
};

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

// Las pantallas de auth tienen diseño claro fijo: dentro de <ForceLightScheme> las
// clases y useColors() resuelven siempre los valores claros, aunque el tema sea oscuro.
const ForcedScheme = createContext<ColorScheme | null>(null);

const lightVars = vars(
  Object.fromEntries(
    Object.entries(tokens.light).map(([name, hex]) => [
      `--color-${name}`,
      [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" "),
    ]),
  ),
);

export function ForceLightScheme({ children }: { children: ReactNode }) {
  return (
    <ForcedScheme.Provider value="light">
      <View style={[{ flex: 1 }, lightVars]}>{children}</View>
    </ForcedScheme.Provider>
  );
}

export function useColors(): Palette {
  const system = useColorScheme();
  const scheme = useContext(ForcedScheme) ?? (system === "dark" ? "dark" : "light");
  return palettes[scheme];
}
