import React, { forwardRef, useState } from "react";
import { View, type TextInput, type TextInputProps } from "react-native";
import { AppText, AppTextInput } from "@/components/ui/AppText";
import { CircleAlert, type LucideIcon } from "lucide-react-native";
import { useColors, useHighContrastBorder } from "../../constants/colors";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: LucideIcon;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const colors = useColors();
    const highContrast = useHighContrastBorder() !== "";

    const borderStyle = error
      ? "border-danger"
      : isFocused
        ? "border-primary"
        : highContrast
          ? "border-border"
          : "border-transparent";

    return (
      <View className="mb-4">
        {label && (
          <AppText className="mb-2 text-sm font-medium text-brand-ink">
            {label}
          </AppText>
        )}

        <View
          className={`min-h-[52px] flex-row items-center rounded-[5px] ${highContrast ? "border-2" : "border"} bg-background px-4 ${borderStyle}`}
        >
          {Icon && (
            <Icon
              size={20}
              color={error ? colors.danger : isFocused ? colors.primary : colors["text-muted"]}
            />
          )}

          <AppTextInput
            ref={ref}
            className={`flex-1 py-3 text-base text-brand-ink ${Icon ? "ml-3" : ""}`}
            textAlignVertical="center"
            placeholderTextColor={colors["text-muted"]}
            onFocus={(event) => {
              setIsFocused(true);
              props.onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              props.onBlur?.(event);
            }}
            {...props}
          />
        </View>

        {error && <FieldError message={error} />}
      </View>
    );
  },
);

Input.displayName = "Input";

// Error de un campo: texto + ícono, no solo el color (HU-07).
export function FieldError({ message }: { message: string }) {
  const colors = useColors();
  return (
    <View className="mt-1.5 flex-row items-center gap-1">
      <CircleAlert size={14} color={colors.danger} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
      <AppText className="shrink text-xs text-danger">{message}</AppText>
    </View>
  );
}
