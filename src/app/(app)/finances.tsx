import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

// ponytail: placeholder hasta definir el contenido de esta sección.
export default function Finances() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-2xl font-bold text-black dark:text-white">{t("nav.finances")}</Text>
    </View>
  );
}
