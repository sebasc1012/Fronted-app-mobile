import { render, screen, fireEvent } from "@testing-library/react-native";
import { setThemePreference } from "../../../../../lib/theme";
import ThemeScreen from "../theme";

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("expo-router", () => ({ Stack: { Screen: () => null } }));
jest.mock("lucide-react-native", () => ({ Check: () => null }));
jest.mock("../../../../../lib/theme", () => ({
  getThemePreference: () => "system",
  setThemePreference: jest.fn(),
}));

const radios = () =>
  screen.getAllByRole("radio").map((r) => [r.props.accessibilityLabel, r.props.accessibilityState.checked]);

describe("ThemeScreen", () => {
  it("shows Light, Dark and System, with System checked by default", async () => {
    await render(<ThemeScreen />);
    expect(radios()).toEqual([
      ["theme.light", false],
      ["theme.dark", false],
      ["theme.system", true],
    ]);
  });

  it("selecting Dark applies it and marks it", async () => {
    await render(<ThemeScreen />);
    await fireEvent.press(screen.getByText("theme.dark"));
    expect(setThemePreference).toHaveBeenCalledWith("dark");
    expect(radios()[1]).toEqual(["theme.dark", true]);
  });
});
