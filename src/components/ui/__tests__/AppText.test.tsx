import { StyleSheet, type TextStyle } from "react-native";
import { act, render, screen } from "@testing-library/react-native";
import { setFontScaleLevel } from "../../../../lib/fontScale";
import { AppText, AppTextInput } from "../AppText";
import { Input } from "../Input";

const flat = (style: unknown) => StyleSheet.flatten(style as TextStyle);

beforeEach(() => setFontScaleLevel("normal"));

describe("AppText", () => {
  it("multiplies the style's fontSize by the level and caps the system scale", async () => {
    await setFontScaleLevel("xlarge");
    await render(<AppText style={{ fontSize: 20, lineHeight: 30 }}>Hola</AppText>);
    const text = screen.getByText("Hola");
    expect(flat(text.props.style)).toMatchObject({ fontSize: 26, lineHeight: 39 });
    expect(text.props.maxFontSizeMultiplier).toBeCloseTo(1.54, 2);
  });

  it("re-renders when the level changes", async () => {
    await render(<AppText style={{ fontSize: 10 }}>Hola</AppText>);
    expect(flat(screen.getByText("Hola").props.style).fontSize).toBe(10);
    await act(() => setFontScaleLevel("large"));
    expect(flat(screen.getByText("Hola").props.style).fontSize).toBe(11.5);
  });

  it("allowFontScaling={false} keeps a fixed size", async () => {
    await setFontScaleLevel("xlarge");
    await render(<AppText allowFontScaling={false} style={{ fontSize: 20 }}>AB</AppText>);
    expect(flat(screen.getByText("AB").props.style).fontSize).toBe(20);
  });
});

describe("AppTextInput / Input", () => {
  it("scales the input text (and so its placeholder)", async () => {
    await setFontScaleLevel("large");
    await render(<AppTextInput testID="field" placeholder="Correo" style={{ fontSize: 16 }} />);
    const field = screen.getByTestId("field");
    expect(flat(field.props.style).fontSize).toBeCloseTo(18.4);
    expect(field.props.maxFontSizeMultiplier).toBeCloseTo(2 / 1.15);
  });

  it("Input uses the scaled field", async () => {
    await setFontScaleLevel("xlarge");
    await render(<Input placeholder="Correo" />);
    expect(screen.getByPlaceholderText("Correo").props.maxFontSizeMultiplier).toBeCloseTo(2 / 1.3);
  });
});
