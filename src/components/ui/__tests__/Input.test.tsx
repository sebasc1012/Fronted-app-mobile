import { render, screen, fireEvent } from "@testing-library/react-native";
import { Input } from "../Input";
import { Button } from "../Button";
import { setHighContrast } from "../../../../lib/preferences";

describe("Input", () => {
  it("renders the label", async () => {
    await render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeTruthy();
  });

  it("renders the error message", async () => {
    await render(<Input label="Email" error="Required" />);
    expect(screen.getByText("Required")).toBeTruthy();
  });

  it("does not render an error message when there is none", async () => {
    await render(<Input label="Email" />);
    expect(screen.queryByText("Required")).toBeNull();
  });

  it("forwards text input to onChangeText", async () => {
    const onChangeText = jest.fn();
    await render(<Input placeholder="Type here" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByPlaceholderText("Type here"), "hello");
    expect(onChangeText).toHaveBeenCalledWith("hello");
  });

  it("calls onFocus and onBlur while still tracking focus state", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await render(
      <Input placeholder="Type here" onFocus={onFocus} onBlur={onBlur} />,
    );
    const field = screen.getByPlaceholderText("Type here");

    await fireEvent(field, "focus");
    expect(onFocus).toHaveBeenCalled();

    await fireEvent(field, "blur");
    expect(onBlur).toHaveBeenCalled();
  });

  it("shows the error with an alert icon, not only the red color", async () => {
    await render(<Input label="Email" error="Required" />);
    expect(screen.getByText("Required")).toBeTruthy();
    expect(screen.getByTestId("icon-CircleAlert", { includeHiddenElements: true })).toBeTruthy(); // decorativo: oculto al lector
  });
});

describe("high contrast borders", () => {
  afterEach(() => setHighContrast(false));

  it("Input and Button get a visible border only with high contrast on", async () => {
    await render(<><Input placeholder="Correo" /><Button title="Seguir" onPress={() => {}} /></>);
    const field = () => screen.getByPlaceholderText("Correo").parent!;
    expect(field().props.className).not.toContain("border-2");
    expect(screen.getByRole("button", { name: "Seguir" }).props.className).not.toContain("border-2");

    await setHighContrast(true);
    await screen.rerender(<><Input placeholder="Correo" /><Button title="Seguir" onPress={() => {}} /></>);
    expect(field().props.className).toContain("border-2 bg-background px-4 border-border");
    expect(screen.getByRole("button", { name: "Seguir" }).props.className).toContain("border-2 border-border");
  });
});
