import { Image } from "react-native";

// Solo existe el asset claro por ahora; agregar una versión dark cuando se provea.
const SOURCE = require("../../../../assets/iconsSingIn/facebook-light.png");

type FacebookIconProps = {
  size?: number;
};

export function FacebookIcon({ size = 20 }: FacebookIconProps) {
  return (
    <Image
      source={SOURCE}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
