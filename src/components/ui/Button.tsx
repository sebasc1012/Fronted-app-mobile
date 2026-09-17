import React, { useState } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  Platform,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import type { LucideIcon } from "lucide-react-native";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "glass"
  | "destructive"
  | "ghost";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: LucideIcon;
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon: Icon,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const isDisabled = disabled || loading;

  const isGlass = variant === "glass";

  const textColor = isGlass
    ? "#111827"
    : variant === "primary"
      ? "#FFFFFF"
      : "#111827";

  const iconColor = textColor;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View className="flex-row items-center justify-center">
          {Icon && <Icon size={18} color={iconColor} strokeWidth={2} />}

          <Text
            className={`text-base font-semibold ${Icon ? "ml-2" : ""}`}
            style={{ color: textColor }}
          >
            {title}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={`h-[52px] overflow-hidden rounded-2xl ${
        isDisabled ? "opacity-50" : ""
      }`}
      style={{
        transform: [
          {
            scale: pressed && !isDisabled ? 0.98 : 1,
          },
        ],
      }}
    >
      {isGlass ? (
        <GlassView
          glassEffectStyle="regular"
          isInteractive={!isDisabled}
          tintColor="#FFFFFF"
          className="flex-1 items-center justify-center"
        >
          {content}
        </GlassView>
      ) : (
        <View
          className={`flex-1 items-center justify-center ${
            variant === "primary" ? "bg-primary" : "bg-gray-200"
          }`}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}
