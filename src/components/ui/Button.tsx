import React, { useState, type ReactNode } from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { useColors } from "../../constants/colors";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "outline";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  pill?: boolean;
  color?: string;
  radius?: number;
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
  pill = false,
  color,
  radius,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const colors = useColors();

  const isDisabled = disabled || loading;
  const textColor =
    variant === "primary" ? colors["on-primary"] : variant === "destructive" ? colors["on-danger"] : colors.text;
  const background = color
    ? ""
    : variant === "primary"
      ? "bg-primary"
      : variant === "destructive"
        ? "bg-danger"
        : variant === "outline"
        ? "border border-border"
        : "bg-surface-strong";
  const roundedClass =
    radius === undefined ? (pill ? "rounded-full" : "rounded-2xl") : "";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={`h-[52px] flex-row items-center justify-center overflow-hidden ${roundedClass} ${background} ${isDisabled ? "opacity-50" : ""}`}
      style={{
        transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        ...(color ? { backgroundColor: color } : {}),
        ...(radius !== undefined ? { borderRadius: radius } : {}),
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}

          <Text
            className={`text-base font-semibold ${icon ? "ml-2" : ""}`}
            style={{ color: textColor }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
