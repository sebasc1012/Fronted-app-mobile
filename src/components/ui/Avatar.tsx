import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
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
  // Se guarda la URL que falló (no un booleano): una foto nueva vuelve a intentarse.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = profile?.avatarUrl;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t("account.avatar")}
      className="items-center justify-center overflow-hidden rounded-full bg-surface-strong"
      style={{ width: size, height: size }}
    >
      {url && url !== failedUrl ? (
        <Image
          testID="avatar-image"
          source={url}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <AppText allowFontScaling={false} className="font-semibold text-text-muted" style={{ fontSize: size * 0.4 }}>
          {getInitials(profile?.fullName, user?.email)}
        </AppText>
      )}
    </View>
  );
}
