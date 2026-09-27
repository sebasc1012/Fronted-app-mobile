import { act, render } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";
import { applyStoredLanguage } from "../../../lib/i18n";
import { applyStoredTheme } from "../../../lib/theme";
import { applyStoredFontScale } from "../../../lib/fontScale";
import Root from "../_layout";

let finishLanguage: () => void = () => {};
let finishTheme: () => void = () => {};
let finishFontScale: () => void = () => {};
jest.mock("../../../global.css", () => ({}));
jest.mock("../../../lib/i18n", () => ({
  applyStoredLanguage: jest.fn(() => new Promise<void>((resolve) => (finishLanguage = resolve))),
}));
jest.mock("../../../lib/theme", () => ({
  applyStoredTheme: jest.fn(() => new Promise<void>((resolve) => (finishTheme = resolve))),
}));
jest.mock("../../../lib/fontScale", () => ({
  applyStoredFontScale: jest.fn(() => new Promise<void>((resolve) => (finishFontScale = resolve))),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("expo-splash-screen", () => ({ preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() }));
jest.mock("expo-router", () => {
  const Stack = Object.assign(() => null, { Protected: () => null, Screen: () => null });
  return { Stack, ThemeProvider: ({ children }: any) => children, DarkTheme: {}, DefaultTheme: {} };
});
jest.mock("../../../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ session: null, isLoading: false }),
}));
jest.mock("../../hooks/useProfile", () => ({ useProfile: () => ({ data: undefined, isLoading: false }) }));

describe("root layout", () => {
  it("applies the saved language, theme and text size before hiding the splash", async () => {
    await render(<Root />);
    expect(applyStoredLanguage).toHaveBeenCalledTimes(1);
    expect(applyStoredTheme).toHaveBeenCalledTimes(1);
    expect(applyStoredFontScale).toHaveBeenCalledTimes(1);

    await act(async () => finishLanguage());
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled(); // falta el tema

    await act(async () => finishTheme());
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled(); // falta el tamaño de texto

    await act(async () => finishFontScale());
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
