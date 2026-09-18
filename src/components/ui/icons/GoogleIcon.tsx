import { Image } from "react-native";

// Recorte sin el círculo de fondo del asset oficial: nuestro botón ya pone su propio
// fondo/borde, y el círculo del asset original dejaba la "G" mucho más chica que
// el logo de Apple/Facebook al mismo `size`.
const SOURCES = {
  light: require("../../../../assets/iconsSingIn/google-light-mark.png"),
  dark: require("../../../../assets/iconsSingIn/google-dark-mark.png"),
};

type GoogleIconProps = {
  size?: number;
  theme?: "light" | "dark";
};

export function GoogleIcon({ size = 20, theme = "light" }: GoogleIconProps) {
  return (
    <Image
      source={SOURCES[theme]}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
