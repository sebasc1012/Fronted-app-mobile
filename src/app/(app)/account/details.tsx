import { View, Text } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Avatar } from "../../../components/ui/Avatar";

export default function AccountDetails() {
  const { user } = useAuth();
  const { data: profile } = useProfile(true);

  return (
    <View className="flex-1 items-center bg-white px-6 pt-32 dark:bg-black">
      <Avatar size={112} />
      {profile?.fullName && (
        <Text className="mt-4 text-2xl font-bold text-black dark:text-white">{profile.fullName}</Text>
      )}
      <Text className="mt-1 text-base text-gray-600 dark:text-gray-400">{user?.email}</Text>
    </View>
  );
}
