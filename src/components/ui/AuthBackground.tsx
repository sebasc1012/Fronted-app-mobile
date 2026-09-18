import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export function AuthBackground() {
  return (
    <View className="absolute inset-0" style={{ backgroundColor: "#E2C9A6" }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        <Path d="M0,38 C25,55 55,92 100,88 L100,100 L0,100 Z" fill="#F7EAD9" />
      </Svg>
    </View>
  );
}
