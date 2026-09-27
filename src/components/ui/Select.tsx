import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useTranslation } from "react-i18next";
import { useHighContrastBorder } from "../../constants/colors";
import { FieldError } from "./Input";

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
  const highContrast = useHighContrastBorder() !== "";
  const borderStyle = error ? "border-danger" : highContrast ? "border-border" : "border-transparent";

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <AppText className="mb-2 text-sm font-medium text-brand-ink">
          {label}
        </AppText>
      )}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        className={`min-h-[52px] flex-row items-center py-3 rounded-[5px] ${highContrast ? "border-2" : "border"} bg-background px-4 ${borderStyle} ${disabled ? "opacity-50" : ""}`}
      >
        <AppText
          className={`text-base ${
            selectedOption ? "text-brand-ink" : "text-text-muted"
          }`}
        >
          {selectedOption?.label ?? placeholder ?? t("common.selectOption")}
        </AppText>
      </Pressable>

      {error && <FieldError message={error} />}

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
            <AppText className="mb-4 text-lg font-semibold text-text">
              {label}
            </AppText>

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
                  <AppText
                    className={`text-base ${
                      selected ? "font-semibold text-text" : "text-text-muted"
                    }`}
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setOpen(false)}
              className="mt-3 items-center rounded-lg bg-surface-strong py-3"
            >
              <AppText className="font-semibold text-text">{t("common.cancel")}</AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
