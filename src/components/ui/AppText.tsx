import { forwardRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- único punto donde se usan Text y TextInput de RN
import { Text, TextInput, type TextInputProps, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { scaleFontStyle, useFontScale } from "../../../lib/preferences";

// Texto de la app (HU-06): aplica el nivel de tamaño elegido encima del tamaño del
// sistema, con tope total MAX_TOTAL_SCALE. `allowFontScaling={false}` lo deja fijo.
export function AppText({ style, allowFontScaling = true, ...props }: TextProps) {
  const { multiplier } = useFontScale();
  if (!allowFontScaling) return <Text {...props} style={style} allowFontScaling={false} />;

  const scaled = scaleFontStyle(style, multiplier);
  return <Text {...props} style={[style, scaled.style]} maxFontSizeMultiplier={scaled.maxFontSizeMultiplier} />;
}

// Campo de texto con el mismo escalado (texto y placeholder).
export const AppTextInput = forwardRef<TextInput, TextInputProps>(({ style, ...props }, ref) => {
  const { multiplier } = useFontScale();
  const scaled = scaleFontStyle(style, multiplier);
  return (
    <TextInput ref={ref} {...props} style={[style, scaled.style]} maxFontSizeMultiplier={scaled.maxFontSizeMultiplier} />
  );
});
AppTextInput.displayName = "AppTextInput";

// NativeWind convierte className en style antes de llegar aquí, así el fontSize de las
// clases (`text-base`, `text-4xl`…) también se escala.
cssInterop(AppText, { className: "style" });
cssInterop(AppTextInput, { className: { target: "style" } });
