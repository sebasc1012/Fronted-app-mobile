import { Pressable, ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react-native";
import { useColors, useHighContrastBorder } from "../../../constants/colors";
import { FONT_SCALES, setFontScaleLevel, useFontScale, type FontScaleLevel } from "../../../../lib/preferences";

const LEVELS = Object.keys(FONT_SCALES) as FontScaleLevel[];

export default function TextSizeScreen() {
  const { t } = useTranslation();
  const { level } = useFontScale();
  const hcBorder = useHighContrastBorder();
  const colors = useColors();

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 px-6 pb-24" contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ headerShown: true, title: t("account.textSize") }} />

      {/* Control segmentado: los segmentos crecen en alto si el texto no cabe. */}
      <View accessibilityRole="radiogroup" className={`mt-4 flex-row rounded-2xl bg-surface p-1 ${hcBorder}`}>
        {LEVELS.map((value) => {
          const selected = value === level;
          return (
            <Pressable
              key={value}
              onPress={() => setFontScaleLevel(value)}
              accessibilityRole="radio"
              accessibilityLabel={t(`textSize.${value}`)}
              accessibilityState={{ checked: selected, selected }}
              className={`min-h-12 flex-1 items-center justify-center gap-1 rounded-xl px-1 py-2 ${selected ? "bg-primary" : ""}`}
            >
              {/* ✓ además del fondo: la selección no depende solo del color (HU-07). */}
              {selected && <Check size={16} color={colors["on-primary"]} />}
              <AppText className={`text-center text-sm font-semibold ${selected ? "text-on-primary" : "text-text"}`}>
                {t(`textSize.${value}`)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Vista previa en vivo: usa AppText, así refleja el nivel elegido. */}
      <View testID="text-size-preview" className={`gap-2 rounded-2xl bg-surface p-4 ${hcBorder}`}>
        <AppText accessibilityRole="header" className="text-xl font-bold text-text">
          {t("textSize.previewTitle")}
        </AppText>
        <AppText className="text-base text-text">{t("textSize.previewBody")}</AppText>
      </View>

      <Button title={t("textSize.reset")} variant="secondary" onPress={() => setFontScaleLevel("normal")} />
    </ScrollView>
  );
}
