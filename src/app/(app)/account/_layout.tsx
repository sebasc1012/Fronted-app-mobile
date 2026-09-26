import { Stack } from "expo-router";

// Stack propio para que `details` se abra encima sin perder la tab bar.
export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="details" options={{ headerShown: true, title: "", headerTransparent: true }} />
    </Stack>
  );
}
