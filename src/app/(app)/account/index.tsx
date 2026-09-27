import { Children, useRef, useState } from "react";
import { ActivityIndicator, Modal, Platform, View, Text, Pressable, ScrollView, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import {
  ALargeSmall,
  Bell,
  ChevronRight,
  FileText,
  Info,
  Languages,
  LogOut,
  ShieldCheck,
  SunMoon,
  Trash2,
  type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useChangeAvatar, type AvatarSource } from "@/hooks/useAvatar";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";

type RowProps = {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  value?: string; // fila de solo lectura: muestra el valor en lugar del chevron
};

function Row({ icon: Icon, label, onPress, danger, value }: RowProps) {
  const dark = useColorScheme() === "dark";
  const color = danger ? "#DC2626" : dark ? "#FFFFFF" : "#000000";
  const content = (
    <>
      <Icon size={22} color={color} />
      <Text className={`flex-1 text-base ${danger ? "text-danger" : "text-black dark:text-white"}`}>{label}</Text>
      {value ? (
        <Text className="text-base text-gray-500 dark:text-gray-400">{value}</Text>
      ) : (
        <ChevronRight size={20} color={dark ? "#9CA3AF" : "#6B7280"} />
      )}
    </>
  );
  const className = "min-h-12 flex-row items-center gap-4 px-4 py-3";

  if (value) {
    return (
      <View accessible accessibilityLabel={`${label}, ${value}`} className={className}>
        {content}
      </View>
    );
  }
  // ponytail: sin onPress hasta que exista la HU de cada fila (tema, idioma, …); tocar no hace nada.
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} className={`${className} active:opacity-60`}>
      {content}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text accessibilityRole="header" className="mb-2 px-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
        {Children.toArray(children).map((child, i) => (
          <View key={i}>
            {i > 0 && <View className="mx-4 h-px bg-gray-200 dark:bg-gray-800" />}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

// Menú inferior propio (no Alert: Android admite máximo 3 botones y HU-03 agrega una opción).
function AvatarMenu({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (source: AvatarSource) => void }) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  // iOS no puede abrir la cámara/galería mientras el Modal se cierra: se espera a onDismiss.
  const chosen = useRef<AvatarSource | null>(null);
  const runChosen = () => {
    if (chosen.current) onPick(chosen.current);
    chosen.current = null;
  };
  const choose = (source: AvatarSource) => {
    chosen.current = source;
    onClose();
    if (Platform.OS !== "ios") runChosen();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onDismiss={runChosen}>
      <View className="flex-1 justify-end">
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/40"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
        />
        <View accessibilityViewIsModal className="gap-3 rounded-t-3xl bg-white p-4 dark:bg-gray-900" style={{ paddingBottom: bottom + 16 }}>
          <Button title={t("avatar.takePhoto")} variant="secondary" onPress={() => choose("camera")} />
          <Button title={t("avatar.chooseFromLibrary")} variant="secondary" onPress={() => choose("library")} />
          <Button title={t("common.cancel")} variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function ProfileHeader() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile(true);
  const { change, isPending } = useChangeAvatar();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!profile && isLoading) {
    return (
      <View testID="profile-skeleton" className="items-center gap-3">
        <View className="h-28 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <View className="h-6 w-40 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
        <View className="h-4 w-52 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
      </View>
    );
  }

  if (!profile && isError) {
    return (
      <View className="items-center gap-3">
        <Text className="text-center text-base text-black dark:text-white">{t("account.loadError")}</Text>
        <Button title={t("common.retry")} onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View className="items-center">
      <Pressable
        onPress={() => setMenuOpen(true)}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityLabel={t("avatar.change")}
        accessibilityState={{ busy: isPending, disabled: isPending }}
      >
        <Avatar size={112} />
        {isPending && (
          <View testID="avatar-uploading" className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}
      </Pressable>
      <AvatarMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onPick={change} />
      {profile?.fullName && (
        <Text className="mt-4 text-center text-2xl font-bold text-black dark:text-white">{profile.fullName}</Text>
      )}
      <Text className="mt-1 text-center text-base text-gray-600 dark:text-gray-400">{user?.email}</Text>
    </View>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="px-6"
      contentContainerStyle={{ paddingTop: top + 16, paddingBottom: bottom + 96 }}
    >
      <ProfileHeader />
      <Section title={t("account.sections.preferences")}>
        <Row icon={SunMoon} label={t("account.theme")} />
        <Row icon={Languages} label={t("account.language")} />
        <Row icon={Bell} label={t("account.notifications")} />
      </Section>
      <Section title={t("account.sections.accessibility")}>
        <Row icon={ALargeSmall} label={t("account.textSize")} />
      </Section>
      <Section title={t("account.sections.privacy")}>
        <Row icon={ShieldCheck} label={t("account.privacyPolicy")} />
        <Row icon={Trash2} label={t("account.deleteAccount")} danger />
      </Section>
      <Section title={t("account.sections.about")}>
        <Row icon={FileText} label={t("account.terms")} />
        <Row icon={Info} label={t("account.version")} value={Constants.expoConfig?.version ?? "—"} />
      </Section>
      <Section title={t("common.signOut")}>
        <Row icon={LogOut} label={t("common.signOut")} onPress={signOut} />
      </Section>
    </ScrollView>
  );
}
