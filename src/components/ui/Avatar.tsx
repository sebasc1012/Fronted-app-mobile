import { useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

// "Sebastián" → S · "Sebastián Castro López" → SL · sin nombre → inicial del correo.
export function getInitials(fullName?: string | null, email?: string | null) {
  const words = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) return (email?.[0] ?? "?").toUpperCase();
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
}

// Avatar del usuario actual: foto del perfil o, si no hay o falla la carga, sus iniciales.
export function Avatar({ size = 44 }: { size?: number }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile(true);
  const [failed, setFailed] = useState(false);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t("account.avatar")}
      className="items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      style={{ width: size, height: size }}
    >
      {profile?.avatarUrl && !failed ? (
        <Image
          testID="avatar-image"
          source={profile.avatarUrl}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text className="font-semibold text-gray-700 dark:text-gray-200" style={{ fontSize: size * 0.4 }}>
          {getInitials(profile?.fullName, user?.email)}
        </Text>
      )}
    </View>
  );
}
