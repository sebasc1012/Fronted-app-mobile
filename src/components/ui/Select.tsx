import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

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
  placeholder,
  error,
  disabled = false,
}: SelectProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-medium text-brand-ink">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        className={`h-[52px] flex-row items-center rounded-[5px] border bg-background px-4 ${
          error ? "border-danger" : "border-transparent"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <Text
          className={`text-base ${
            selectedOption ? "text-brand-ink" : "text-text-muted"
          }`}
        >
          {selectedOption?.label ?? placeholder ?? t("common.selectOption")}
        </Text>
      </Pressable>

      {error && <Text className="mt-1.5 text-xs text-danger">{error}</Text>}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-overlay/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="rounded-t-2xl bg-background px-6 pb-8 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-lg font-semibold text-text">
              {label}
            </Text>

            {options.map((option) => {
              const selected = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`rounded-lg px-4 py-4 ${
                    selected ? "bg-surface" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selected ? "font-semibold text-text" : "text-text-muted"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setOpen(false)}
              className="mt-3 items-center rounded-lg bg-surface-strong py-3"
            >
              <Text className="font-semibold text-text">{t("common.cancel")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
