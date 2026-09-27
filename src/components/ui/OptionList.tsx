import { Pressable, Text, View, useColorScheme } from "react-native";
import { Check } from "lucide-react-native";

type OptionListProps<T extends string> = {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

// Lista de opciones excluyentes (idioma, tema…): la activa lleva ✓ y se anuncia como marcada.
export function OptionList<T extends string>({ options, selected, onSelect }: OptionListProps<T>) {
  const dark = useColorScheme() === "dark";

  return (
    <View accessibilityRole="radiogroup" className="mt-4 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
      {options.map(({ value, label }, i) => (
        <View key={value}>
          {i > 0 && <View className="mx-4 h-px bg-gray-200 dark:bg-gray-800" />}
          <Pressable
            onPress={() => onSelect(value)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: selected === value }}
            className="min-h-12 flex-row items-center px-4 py-3 active:opacity-60"
          >
            <Text className="flex-1 text-base text-black dark:text-white">{label}</Text>
            {selected === value && <Check size={20} color={dark ? "#818CF8" : "#4F46E5"} />}
          </Pressable>
        </View>
      ))}
    </View>
  );
}
