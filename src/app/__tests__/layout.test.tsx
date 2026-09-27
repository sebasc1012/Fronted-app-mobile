import { act, render } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";
import { applyStoredLanguage } from "../../../lib/i18n";
import Root from "../_layout";

let finishLanguage: () => void = () => {};
jest.mock("../../../global.css", () => ({}));
jest.mock("../../../lib/i18n", () => ({
  applyStoredLanguage: jest.fn(() => new Promise<void>((resolve) => (finishLanguage = resolve))),
}));
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
  it("applies the saved language before hiding the splash", async () => {
    await render(<Root />);
    expect(applyStoredLanguage).toHaveBeenCalledTimes(1);
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    await act(async () => finishLanguage());
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
