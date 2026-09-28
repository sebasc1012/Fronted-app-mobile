import { render, screen, fireEvent } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { setLanguagePreference } from "../../../../../lib/i18n";
import LanguageScreen from "../language";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock("expo-localization", () => ({ getLocales: () => [{ languageCode: "fr" }] }));
jest.mock("expo-router", () => ({ Stack: { Screen: () => null } }));
jest.mock("lucide-react-native", () => ({ Check: () => null }));

const radios = () =>
  screen.getAllByRole("radio").map((r) => [r.props.accessibilityLabel, r.props.accessibilityState.checked]);

beforeEach(() => setLanguagePreference("system"));

describe("LanguageScreen", () => {
  it("lists the 3 options in order, in Spanish, with the device option checked by default", async () => {
    await render(<LanguageScreen />);
    expect(radios()).toEqual([
      ["Usar idioma del dispositivo", true],
      ["Español", false],
      ["English", false],
    ]);
  });

  it("selecting English switches the app to English and saves it; native names stay the same", async () => {
    await render(<LanguageScreen />);
    await fireEvent.press(screen.getByText("English"));

    expect(i18n.language).toBe("en");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.language", "en");
    expect(radios()).toEqual([
      ["Use device language", false],
      ["Español", false],
      ["English", true],
    ]);
  });
});
