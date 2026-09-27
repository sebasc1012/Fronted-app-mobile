import React, { forwardRef, useState } from "react";
import { View, type TextInput, type TextInputProps } from "react-native";
import { AppText, AppTextInput } from "@/components/ui/AppText";
import type { LucideIcon } from "lucide-react-native";
import { useColors } from "../../constants/colors";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: LucideIcon;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const colors = useColors();

    const borderStyle = error
      ? "border-danger"
      : isFocused
        ? "border-primary"
        : "border-transparent";

    return (
      <View className="mb-4">
        {label && (
          <AppText className="mb-2 text-sm font-medium text-brand-ink">
            {label}
          </AppText>
        )}

        <View
          className={`min-h-[52px] flex-row items-center rounded-[5px] border bg-background px-4 ${borderStyle}`}
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

        {error && <AppText className="mt-1.5 text-xs text-danger">{error}</AppText>}
      </View>
    );
  },
);

Input.displayName = "Input";
