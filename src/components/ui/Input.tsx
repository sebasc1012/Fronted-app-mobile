import { TextInput, TextInputProps, View, Text } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>}
      <TextInput
        className={`rounded-lg border px-4 py-3 text-base ${
          error ? "border-danger" : "border-gray-300"
        }`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}
    </View>
  );
}