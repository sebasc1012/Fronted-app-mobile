import { View, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { AuthBackground } from "../../components/ui/AuthBackground";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <View className="flex-1">
      <AuthBackground />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-xl font-semibold">{t("auth.verifyEmail.title")}</Text>
        <Text className="mb-6 text-center text-gray-600">
          {email
            ? t("auth.verifyEmail.message", { email })
            : t("auth.verifyEmail.messageNoEmail")}
        </Text>
        <Button
          title={t("auth.verifyEmail.goToLogin")}
          onPress={() => router.replace("/(auth)/login")}
        />
      </View>
    </View>
  );
}
