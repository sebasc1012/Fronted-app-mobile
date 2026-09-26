import { View, Text, Pressable, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { LogOut, SunMoon, Trash2, type LucideIcon } from "lucide-react-native";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { useAuth } from "../../../../contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

type OptionProps = {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  danger?: boolean;
};

function Option({ icon: Icon, label, onPress, danger }: OptionProps) {
  const dark = useColorScheme() === "dark";
  const color = danger ? "#DC2626" : dark ? "#FFFFFF" : "#000000";

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-row items-center gap-4 px-4 py-4 active:opacity-60">
      <Icon size={22} color={color} />
      <Text className={`text-base ${danger ? "text-danger" : "text-black dark:text-white"}`}>{label}</Text>
    </Pressable>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(true);

  return (
    <View className="flex-1 bg-white px-6 dark:bg-black">
      <ScreenHeader
        title={profile?.fullName || user?.email || t("nav.account")}
        onAvatarPress={() => router.push("/account/details")}
      />
      <View className="mt-8 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
        {/* ponytail: tema y eliminar cuenta sin lógica todavía (eliminar debe pedir confirmación). */}
        <Option icon={SunMoon} label={t("account.theme")} />
        <View className="mx-4 h-px bg-gray-200 dark:bg-gray-800" />
        <Option icon={LogOut} label={t("common.signOut")} onPress={signOut} />
        <View className="mx-4 h-px bg-gray-200 dark:bg-gray-800" />
        <Option icon={Trash2} label={t("account.deleteAccount")} danger />
      </View>
    </View>
  );
}
