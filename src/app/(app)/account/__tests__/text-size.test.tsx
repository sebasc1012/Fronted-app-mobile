import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, fireEvent, within } from "@testing-library/react-native";
import { setFontScaleLevel } from "../../../../../lib/preferences";
import TextSizeScreen from "../text-size";

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("expo-router", () => ({ Stack: { Screen: () => null } }));

const radios = () =>
  screen.getAllByRole("radio").map((r) => [r.props.accessibilityLabel, r.props.accessibilityState.checked]);
const previewTitleSize = () =>
  StyleSheet.flatten(within(screen.getByTestId("text-size-preview")).getByText("textSize.previewTitle").props.style)
    .fontSize;

beforeEach(async () => {
  await setFontScaleLevel("normal");
  jest.clearAllMocks();
});

describe("TextSizeScreen", () => {
  it("shows the 4 levels with Normal selected by default", async () => {
    await render(<TextSizeScreen />);
    expect(radios()).toEqual([
      ["textSize.small", false],
      ["textSize.normal", true],
      ["textSize.large", false],
      ["textSize.xlarge", false],
    ]);
  });

  it("selecting a level updates the preview live and saves it", async () => {
    await render(<TextSizeScreen />);
    const normalSize = previewTitleSize();

    await fireEvent.press(screen.getByRole("radio", { name: "textSize.xlarge" }));

    expect(radios()[3]).toEqual(["textSize.xlarge", true]);
    expect(previewTitleSize()).toBeCloseTo(normalSize * 1.3);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.fontScale", "xlarge");
  });

  it("'Reset' goes back to Normal and saves it", async () => {
    await setFontScaleLevel("large");
    await render(<TextSizeScreen />);
    await fireEvent.press(screen.getByText("textSize.reset"));
    expect(radios()[1]).toEqual(["textSize.normal", true]);
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith("pref.fontScale", "normal");
  });
});
