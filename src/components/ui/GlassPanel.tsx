import type { ReactNode } from "react";
import { View } from "react-native";
import { BlurView } from "expo-blur";

type GlassPanelProps = {
  children: ReactNode;
};

export function GlassPanel({ children }: GlassPanelProps) {
  return (
    <View
      style={{
        borderRadius: 26,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      <BlurView
        intensity={40}
        tint="light"
        style={{
          borderRadius: 26,
          overflow: "hidden",
          padding: 20,
          backgroundColor: "rgba(255,255,255,0.25)",
        }}
      >
        {children}
      </BlurView>
    </View>
  );
}
