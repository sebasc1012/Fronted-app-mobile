import { ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
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
      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-6 py-10">
        <AppText className="mb-2 text-xl font-semibold">{t("auth.verifyEmail.title")}</AppText>
        <AppText className="mb-6 text-center text-text-muted">
          {email
            ? t("auth.verifyEmail.message", { email })
            : t("auth.verifyEmail.messageNoEmail")}
        </AppText>
        <Button
          title={t("auth.verifyEmail.goToLogin")}
          onPress={() => router.replace("/(auth)/login")}
        />
      </ScrollView>
    </View>
  );
}
