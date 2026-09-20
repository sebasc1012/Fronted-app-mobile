import React, { forwardRef, useState } from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: LucideIcon;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const borderStyle = error
      ? "border-danger"
      : isFocused
        ? "border-primary"
        : "border-transparent";

    return (
      <View className="mb-4">
        {label && (
          <Text className="mb-2 text-sm font-medium text-[#2E2A28]">
            {label}
          </Text>
        )}

        <View
          className={`h-[52px] flex-row items-center rounded-[5px] border bg-white px-4 ${borderStyle}`}
        >
          {Icon && (
            <Icon
              size={20}
              color={error ? "#DC2626" : isFocused ? "#4F46E5" : "#6B7280"}
            />
          )}

          <TextInput
            ref={ref}
            className={`flex-1 text-base leading-[16px] text-[#2E2A28] ${Icon ? "ml-3" : ""}`}
            textAlignVertical="center"
            placeholderTextColor="#9CA3AF"
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

        {error && <Text className="mt-1.5 text-xs text-danger">{error}</Text>}
      </View>
    );
  },
);

Input.displayName = "Input";
