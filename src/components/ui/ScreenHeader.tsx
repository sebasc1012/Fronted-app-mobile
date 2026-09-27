import { View, Pressable } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";

type ScreenHeaderProps = {
  title: string;
  onAvatarPress: () => void;
};

// Título grande a la izquierda + avatar a la derecha (Home, Account).
export function ScreenHeader({ title, onAvatarPress }: ScreenHeaderProps) {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-row items-center justify-between gap-4" style={{ paddingTop: top + 8 }}>
      <AppText className="flex-1 text-4xl font-bold text-text" numberOfLines={2}>
        {title}
      </AppText>
      <Pressable onPress={onAvatarPress} accessibilityRole="button" accessibilityLabel={t("nav.account")}>
        <Avatar />
      </Pressable>
    </View>
  );
}
