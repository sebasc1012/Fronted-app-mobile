import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
      <Text className="mb-2 text-3xl font-bold text-black dark:text-white">Fincho</Text>
      <Text className="mb-6 text-gray-600 dark:text-gray-400">{user?.email}</Text>
      <Button title={t("common.signOut")} onPress={signOut} variant="secondary" />
    </View>
  );
}
