import { render, screen } from "@testing-library/react-native";
import { OptionList } from "../OptionList";
import { palettes } from "../../../constants/colors";

let mockScheme = "light";
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: () => mockScheme }));
jest.mock("lucide-react-native", () => {
  const { View: MockView } = require("react-native");
  return { Check: (props: object) => <MockView testID="check" {...props} /> };
});

const list = () => <OptionList options={[{ value: "a", label: "A" }]} selected="a" onSelect={() => {}} />;

describe("OptionList", () => {
  it("follows the resolved color scheme (light → dark)", async () => {
    mockScheme = "light";
    await render(list());
    expect(screen.getByTestId("check").props.color).toBe(palettes.light.primary);

    mockScheme = "dark"; // el sistema cambia a oscuro
    await screen.rerender(list());
    expect(screen.getByTestId("check").props.color).toBe(palettes.dark.primary);
  });

  it("marks the active option with ✓ and a selected state, not only a color", async () => {
    await render(list());
    expect(screen.getByRole("radio", { name: "A" }).props.accessibilityState).toMatchObject({ selected: true, checked: true });
    expect(screen.getByTestId("check")).toBeTruthy();
  });
});
