import { useState } from "react";
import { ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { getThemePreference, setThemePreference, type ThemePreference } from "../../../../lib/theme";
import { OptionList } from "../../../components/ui/OptionList";

export default function ThemeScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(getThemePreference);

  const select = (value: ThemePreference) => {
    setSelected(value);
    setThemePreference(value);
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black" contentContainerClassName="px-6 pb-24" contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ headerShown: true, title: t("account.theme") }} />
      <OptionList
        options={[
          { value: "light", label: t("theme.light") },
          { value: "dark", label: t("theme.dark") },
          { value: "system", label: t("theme.system") },
        ]}
        selected={selected}
        onSelect={select}
      />
    </ScrollView>
  );
}
