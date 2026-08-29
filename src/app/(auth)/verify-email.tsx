import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button } from "../../components/ui/Button";
import { router } from "expo-router";

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-xl font-semibold">Revisa tu correo</Text>
      <Text className="mb-6 text-center text-gray-600">
        Enviamos un enlace de confirmación a {email}. Ábrelo para activar tu
        cuenta.
      </Text>
      <Button
        title="Ir a iniciar sesión"
        onPress={() => router.replace("/(auth)/login")}
      />
    </View>
  );
}
