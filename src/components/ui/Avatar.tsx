import { useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useAuth } from "../../../contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

// Avatar del usuario actual: foto del perfil o, si no hay o falla la carga, su inicial.
export function Avatar({ size = 44 }: { size?: number }) {
  const { user } = useAuth();
  const { data: profile } = useProfile(true);
  const [failed, setFailed] = useState(false);
  const initial = (profile?.fullName || user?.email || "?")[0].toUpperCase();

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      style={{ width: size, height: size }}
    >
      {profile?.avatarUrl && !failed ? (
        <Image
          source={profile.avatarUrl}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text className="font-semibold text-gray-700 dark:text-gray-200" style={{ fontSize: size * 0.4 }}>
          {initial}
        </Text>
      )}
    </View>
  );
}
