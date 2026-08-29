import { View, Text } from "react-native";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-xl font-semibold">¡Bienvenido!</Text>
      <Text className="mb-6 text-gray-600">{user?.email}</Text>
      <Button title="Cerrar sesión" onPress={signOut} variant="secondary" />
    </View>
  );
}
