import { useState } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { getLanguagePreference, setLanguagePreference, type LanguagePreference } from "../../../../lib/i18n";

// Los idiomas se muestran en su propio idioma, sin importar el activo (única excepción a i18n).
const NATIVE_NAMES = { es: "Español", en: "English" } as const;

export default function LanguageScreen() {
  const { t } = useTranslation();
  const dark = useColorScheme() === "dark";
  const [selected, setSelected] = useState(getLanguagePreference);

  const options: { value: LanguagePreference; label: string }[] = [
    { value: "system", label: t("language.system") },
    { value: "es", label: NATIVE_NAMES.es },
    { value: "en", label: NATIVE_NAMES.en },
  ];

  const select = (value: LanguagePreference) => {
    setSelected(value);
    setLanguagePreference(value);
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black" contentContainerClassName="px-6 pb-24" contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ headerShown: true, title: t("account.language") }} />
      <View accessibilityRole="radiogroup" className="mt-4 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
        {options.map(({ value, label }, i) => (
          <View key={value}>
            {i > 0 && <View className="mx-4 h-px bg-gray-200 dark:bg-gray-800" />}
            <Pressable
              onPress={() => select(value)}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ checked: selected === value }}
              className="min-h-12 flex-row items-center px-4 py-3 active:opacity-60"
            >
              <Text className="flex-1 text-base text-black dark:text-white">{label}</Text>
              {selected === value && <Check size={20} color={dark ? "#818CF8" : "#4F46E5"} />}
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
