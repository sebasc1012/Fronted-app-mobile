import { Children, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Switch, View, Pressable, ScrollView, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  ALargeSmall,
  Bell,
  ChevronRight,
  Contrast,
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
import { useColors, useHighContrastBorder } from "../../../constants/colors";
import { setHighContrast, usePreferences } from "../../../../lib/preferences";
import { restoreFocus, useAnnounce } from "@/hooks/useAnnounce";

type RowProps = {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  value?: string; // fila de solo lectura: muestra el valor en lugar del chevron
  busy?: boolean; // acción en curso: spinner y no presionable
};

function Row({ icon: Icon, label, onPress, danger, value, busy }: RowProps) {
  const colors = useColors();
  const color = danger ? colors.danger : colors.text;
  const content = (
    <>
      <Icon size={22} color={color} />
      <AppText className={`flex-1 text-base ${danger ? "text-danger" : "text-text"}`}>{label}</AppText>
      {value ? (
        <AppText className="text-base text-text-muted">{value}</AppText>
      ) : busy ? (
        <ActivityIndicator />
      ) : (
        <ChevronRight size={20} color={colors["text-muted"]} />
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
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled: busy }}
      className={`${className} active:opacity-60`}
    >
      {content}
    </Pressable>
  );
}

// Fila con interruptor: toda la fila es un único elemento "switch" para el lector de pantalla.
function SwitchRow({ icon: Icon, label, description, value, onValueChange }: {
  icon: LucideIcon;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      className="min-h-12 flex-row items-center gap-4 px-4 py-3"
    >
      <Icon size={22} color={colors.text} />
      <View className="flex-1">
        <AppText className="text-base text-text">{label}</AppText>
        <AppText className="text-sm text-text-muted">{description}</AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors["surface-strong"] }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const hcBorder = useHighContrastBorder();
  return (
    <View className="mt-6">
      <AppText accessibilityRole="header" className="mb-2 px-4 text-sm font-semibold uppercase text-text-muted">
        {title}
      </AppText>
      <View className={`overflow-hidden rounded-2xl bg-surface ${hcBorder}`}>
        {Children.toArray(children).map((child, i) => (
          <View key={i}>
            {i > 0 && <View className="mx-4 h-px bg-surface-strong" />}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

// Menú inferior propio (no Alert: Android admite máximo 3 botones y HU-03 agrega una opción).
type AvatarMenuProps = {
  visible: boolean;
  onClose: () => void;
  onPick: (source: AvatarSource) => void;
  onRemove?: () => void; // solo si hay foto
  onDismissed: () => void; // el modal terminó de cerrarse: devolver el foco al origen
};

function AvatarMenu({ visible, onClose, onPick, onRemove, onDismissed }: AvatarMenuProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const { bottom } = useSafeAreaInsets();
  // iOS no puede presentar otra vista (cámara, galería, Alert) mientras el Modal se cierra: se espera a onDismiss.
  const chosen = useRef<(() => void) | null>(null);
  const runChosen = () => {
    chosen.current?.();
    chosen.current = null;
  };
  const close = () => {
    onClose();
    if (Platform.OS !== "ios") onDismissed(); // en iOS espera a onDismiss
  };
  const choose = (action: () => void) => {
    chosen.current = action;
    close();
    if (Platform.OS !== "ios") runChosen();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
      onDismiss={() => {
        runChosen();
        onDismissed();
      }}
    >
      <View className="flex-1 justify-end">
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-overlay/40"
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
        />
        <View accessibilityViewIsModal className="gap-3 rounded-t-3xl bg-surface p-4" style={{ paddingBottom: bottom + 16 }}>
          <Button title={t("avatar.takePhoto")} variant="secondary" onPress={() => choose(() => onPick("camera"))} />
          <Button title={t("avatar.chooseFromLibrary")} variant="secondary" onPress={() => choose(() => onPick("library"))} />
          {onRemove && (
            <Button
              title={t("avatar.remove")}
              variant="destructive"
              icon={<Trash2 size={18} color={colors["on-danger"]} />}
              onPress={() => choose(onRemove)}
            />
          )}
          <Button title={t("common.cancel")} variant="outline" onPress={close} />
        </View>
      </View>
    </Modal>
  );
}

function ProfileHeader() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile(true);
  const colors = useColors();
  const { change, remove, isPending } = useChangeAvatar();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<View>(null);
  useAnnounce(!profile && isError ? t("account.loadError") : null);

  if (!profile && isLoading) {
    return (
      <View testID="profile-skeleton" className="items-center gap-3">
        <View className="h-28 w-28 animate-pulse rounded-full bg-surface-strong" />
        <View className="h-6 w-40 animate-pulse rounded-md bg-surface-strong" />
        <View className="h-4 w-52 animate-pulse rounded-md bg-surface-strong" />
      </View>
    );
  }

  if (!profile && isError) {
    return (
      <View className="items-center gap-3">
        <AppText className="text-center text-base text-text">{t("account.loadError")}</AppText>
        <Button title={t("common.retry")} onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View className="items-center">
      {/* Un solo elemento: "Foto de perfil", imagen y botón; Avatar (y sus iniciales) queda dentro. */}
      <Pressable
        ref={avatarRef}
        onPress={() => setMenuOpen(true)}
        disabled={isPending}
        accessibilityRole="imagebutton"
        accessibilityLabel={t("account.avatar")}
        accessibilityHint={t("avatar.changeHint")}
        accessibilityState={{ busy: isPending, disabled: isPending }}
      >
        <Avatar size={112} />
        {isPending && (
          <View testID="avatar-uploading" className="absolute inset-0 items-center justify-center rounded-full bg-overlay/40">
            <ActivityIndicator color={colors["on-overlay"]} />
          </View>
        )}
      </Pressable>
      <AvatarMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPick={change}
        onRemove={profile?.avatarUrl ? remove : undefined}
        onDismissed={() => restoreFocus(avatarRef)}
      />
      {profile?.fullName && (
        <AppText className="mt-4 text-center text-2xl font-bold text-text">{profile.fullName}</AppText>
      )}
      <AppText className="mt-1 text-center text-base text-text-muted">{user?.email}</AppText>
    </View>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { top, bottom } = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);
  const { highContrast } = usePreferences();

  // Sin navegar a mano: al quedar session en null, el gate del root muestra (auth).
  const confirmSignOut = () =>
    Alert.alert(t("signOut.title"), t("signOut.message"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.signOut"),
        style: "destructive",
        onPress: () => {
          setSigningOut(true);
          signOut().finally(() => setSigningOut(false));
        },
      },
    ]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6"
      contentContainerStyle={{ paddingTop: top + 16, paddingBottom: bottom + 96 }}
    >
      <ProfileHeader />
      <Section title={t("account.sections.preferences")}>
        <Row icon={SunMoon} label={t("account.theme")} onPress={() => router.push("/account/theme")} />
        <Row icon={Languages} label={t("account.language")} onPress={() => router.push("/account/language")} />
        <Row icon={Bell} label={t("account.notifications")} />
      </Section>
      <Section title={t("account.sections.accessibility")}>
        <Row icon={ALargeSmall} label={t("account.textSize")} onPress={() => router.push("/account/text-size")} />
        <SwitchRow
          icon={Contrast}
          label={t("account.highContrast")}
          description={t("account.highContrastHint")}
          value={highContrast}
          onValueChange={setHighContrast}
        />
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
        <Row icon={LogOut} label={t("common.signOut")} onPress={confirmSignOut} busy={signingOut} />
      </Section>
    </ScrollView>
  );
}
