import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyStoredTheme, getThemePreference, setThemePreference } from "../theme";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));

const setColorScheme = jest.spyOn(Appearance, "setColorScheme").mockImplementation(() => {});

beforeEach(() => jest.clearAllMocks());

describe("theme preference", () => {
  it("defaults to 'system' when nothing is saved", async () => {
    await applyStoredTheme();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("pref.theme");
    expect(getThemePreference()).toBe("system");
    expect(setColorScheme).toHaveBeenCalledWith("unspecified");
  });

  it.each(["dark", "light"] as const)("selecting '%s' forces it and saves it", async (value) => {
    await setThemePreference(value);
    expect(setColorScheme).toHaveBeenCalledWith(value);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.theme", value);
  });

  it("selecting 'system' gives control back to the OS and saves it", async () => {
    await setThemePreference("system");
    expect(setColorScheme).toHaveBeenCalledWith("unspecified");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.theme", "system");
  });

  it("applies the saved theme at startup", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("dark");
    await applyStoredTheme();
    expect(getThemePreference()).toBe("dark");
    expect(setColorScheme).toHaveBeenCalledWith("dark");
  });
});
