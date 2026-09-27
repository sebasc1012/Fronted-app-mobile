import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

// ponytail: placeholder hasta definir el contenido de esta sección.
export default function Library() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-text">{t("nav.library")}</Text>
    </View>
  );
}
