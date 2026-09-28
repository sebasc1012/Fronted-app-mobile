import { useState } from "react";
import { ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { getLanguagePreference, setLanguagePreference, type LanguagePreference } from "../../../../lib/i18n";
import { OptionList } from "../../../components/ui/OptionList";

// Los idiomas se muestran en su propio idioma, sin importar el activo (única excepción a i18n).
const NATIVE_NAMES = { es: "Español", en: "English" } as const;

export default function LanguageScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(getLanguagePreference);

  const select = (value: LanguagePreference) => {
    setSelected(value);
    setLanguagePreference(value);
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-6 pb-24" contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ headerShown: true, title: t("account.language") }} />
      <OptionList
        options={[
          { value: "system", label: t("language.system") },
          { value: "es", label: NATIVE_NAMES.es },
          { value: "en", label: NATIVE_NAMES.en },
        ]}
        selected={selected}
        onSelect={select}
      />
    </ScrollView>
  );
}
