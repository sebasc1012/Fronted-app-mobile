import { Stack } from "expo-router";

// Stack propio para que las pantallas de cada fila se abran encima sin perder la tab bar.
export default function AccountLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
