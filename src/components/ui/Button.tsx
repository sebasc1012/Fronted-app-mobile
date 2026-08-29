import { Pressable, Text, ActivityIndicator } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const bg = variant === "primary" ? "bg-primary" : "bg-gray-200";
  const textColor = variant === "primary" ? "text-white" : "text-gray-900";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center justify-center rounded-lg py-3 ${bg} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#111"} />
      ) : (
        <Text className={`text-base font-semibold ${textColor}`}>{title}</Text>
      )}
    </Pressable>
  );
}