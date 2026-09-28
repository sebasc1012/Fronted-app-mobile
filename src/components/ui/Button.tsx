import React, { useState, type ReactNode } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useColors, useHighContrastBorder } from "../../constants/colors";

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
  const hcBorder = useHighContrastBorder();

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
      className={`min-h-[52px] flex-row items-center px-4 py-3 justify-center overflow-hidden ${roundedClass} ${background} ${hcBorder} ${isDisabled ? "opacity-50" : ""}`}
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

          <AppText
            className={`shrink text-center text-base font-semibold ${icon ? "ml-2" : ""}`}
            style={{ color: textColor }}
          >
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
