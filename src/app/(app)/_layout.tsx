import { useColorScheme } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

// Tab bar nativa: en iOS 26 trae Liquid Glass y sus animaciones (píldora, lente, arrastre).
export default function AppLayout() {
  const { t } = useTranslation();
  const dark = useColorScheme() === "dark";

  return (
    <NativeTabs tintColor={dark ? "#818CF8" : "#4F46E5"}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house" md="home" />
        <NativeTabs.Trigger.Label>{t("nav.home")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Icon sf="book" md="menu_book" />
        <NativeTabs.Trigger.Label>{t("nav.library")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="finances">
        <NativeTabs.Trigger.Icon sf="wallet.bifold" md="account_balance_wallet" />
        <NativeTabs.Trigger.Label>{t("nav.finances")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
        <NativeTabs.Trigger.Label>{t("nav.settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
