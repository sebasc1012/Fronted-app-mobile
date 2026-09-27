import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { applyStoredLanguage, getLanguagePreference, resolveLanguage, setLanguagePreference } from "../i18n";

let mockDeviceLanguage = "es";
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock("expo-localization", () => ({ getLocales: () => [{ languageCode: mockDeviceLanguage }] }));

const getItem = AsyncStorage.getItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockDeviceLanguage = "es";
});

describe("resolveLanguage", () => {
  it("follows the device for 'system' and defaults to Spanish when unsupported", () => {
    expect(resolveLanguage("system", "es")).toBe("es"); // es-CO, es-MX… → languageCode "es"
    expect(resolveLanguage("system", "en")).toBe("en");
    expect(resolveLanguage("system", "fr")).toBe("es");
    expect(resolveLanguage("system", undefined)).toBe("es");
    expect(resolveLanguage("en", "es")).toBe("en");
  });
});

describe("stored preference", () => {
  it("applies the saved language at startup", async () => {
    getItem.mockResolvedValueOnce("en");
    await applyStoredLanguage();
    expect(getItem).toHaveBeenCalledWith("pref.language");
    expect(i18n.language).toBe("en");
    expect(getLanguagePreference()).toBe("en");
  });

  it("uses 'system' when nothing is saved", async () => {
    await setLanguagePreference("system");
    getItem.mockResolvedValueOnce(null);
    mockDeviceLanguage = "fr";
    await applyStoredLanguage();
    expect(getLanguagePreference()).toBe("system");
    expect(i18n.language).toBe("es");
  });

  it("selecting English changes the language and saves 'en'", async () => {
    await setLanguagePreference("en");
    expect(i18n.language).toBe("en");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.language", "en");
  });
});
