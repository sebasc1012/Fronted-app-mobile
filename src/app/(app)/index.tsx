import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ScreenHeader } from "../../components/ui/ScreenHeader";

export default function Home() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white px-6 dark:bg-black">
      <ScreenHeader title="Fincho" onAvatarPress={() => router.push("/account")} />
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-black dark:text-white">{t("home.welcome")}</Text>
      </View>
    </View>
  );
}
