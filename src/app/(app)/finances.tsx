import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTranslation } from "react-i18next";

// ponytail: placeholder hasta definir el contenido de esta sección.
export default function Finances() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <AppText className="text-2xl font-bold text-text">{t("nav.finances")}</AppText>
    </View>
  );
}
