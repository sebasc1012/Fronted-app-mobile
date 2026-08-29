import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type SelectProps<T extends string> = {
  label?: string;
  value: T | null;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecciona una opción",
  error,
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      )}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        className={`rounded-lg border px-4 py-3 ${
          error ? "border-danger" : "border-gray-300"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <Text
          className={`text-base ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
      </Pressable>

      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="rounded-t-2xl bg-white px-6 pb-8 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              {label}
            </Text>

            {options.map((option) => {
              const selected = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`rounded-lg px-4 py-4 ${
                    selected ? "bg-gray-100" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selected ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setOpen(false)}
              className="mt-3 items-center rounded-lg bg-gray-200 py-3"
            >
              <Text className="font-semibold text-gray-900">Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
