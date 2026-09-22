import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function Home() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(true);
  const { top } = useSafeAreaInsets();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const initial = (profile?.fullName || user?.email || "?")[0].toUpperCase();

  return (
    <View className="flex-1 bg-white px-6 dark:bg-black" style={{ paddingTop: top + 8 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-4xl font-bold text-black dark:text-white">Fincho</Text>
        <Pressable
          onPress={() => router.push("/profile")}
          accessibilityRole="button"
          accessibilityLabel={t("home.profile")}
          className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {profile?.avatarUrl && !avatarFailed ? (
            <Image
              source={profile.avatarUrl}
              style={{ width: 44, height: 44 }}
              contentFit="cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <Text className="text-lg font-semibold text-gray-700 dark:text-gray-200">{initial}</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="mb-2 text-xl font-semibold text-black dark:text-white">{t("home.welcome")}</Text>
        <Text className="mb-6 text-gray-600 dark:text-gray-400">{user?.email}</Text>
        <Button title={t("common.signOut")} onPress={signOut} variant="secondary" />
      </View>
    </View>
  );
}
