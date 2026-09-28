import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ScreenHeader } from "../../components/ui/ScreenHeader";

export default function Home() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background px-6">
      <ScreenHeader title={t("app.name")} onAvatarPress={() => router.push("/account")} />
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-semibold text-text">{t("home.welcome")}</AppText>
      </View>
    </View>
  );
}
