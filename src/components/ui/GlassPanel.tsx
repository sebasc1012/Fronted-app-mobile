import type { ReactNode } from "react";
import { View } from "react-native";
import { BlurView } from "expo-blur";
import { palettes } from "../../constants/colors";

type GlassPanelProps = {
  children: ReactNode;
};

export function GlassPanel({ children }: GlassPanelProps) {
  return (
    <View
      style={{
        borderRadius: 26,
        shadowColor: palettes.light.overlay,
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
          backgroundColor: `${palettes.light.background}40`, // blanco al 25 %
        }}
      >
        {children}
      </BlurView>
    </View>
  );
}
