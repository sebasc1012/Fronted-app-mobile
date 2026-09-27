import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { useColors } from "../../constants/colors";

type OptionListProps<T extends string> = {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

// Lista de opciones excluyentes (idioma, tema…): la activa lleva ✓ y se anuncia como marcada.
export function OptionList<T extends string>({ options, selected, onSelect }: OptionListProps<T>) {
  const colors = useColors();

  return (
    <View accessibilityRole="radiogroup" className="mt-4 overflow-hidden rounded-2xl bg-surface">
      {options.map(({ value, label }, i) => (
        <View key={value}>
          {i > 0 && <View className="mx-4 h-px bg-surface-strong" />}
          <Pressable
            onPress={() => onSelect(value)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: selected === value }}
            className="min-h-12 flex-row items-center px-4 py-3 active:opacity-60"
          >
            <Text className="flex-1 text-base text-text">{label}</Text>
            {selected === value && <Check size={20} color={colors.primary} />}
          </Pressable>
        </View>
      ))}
    </View>
  );
}
