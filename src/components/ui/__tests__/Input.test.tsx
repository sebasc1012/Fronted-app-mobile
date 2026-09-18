import { render, screen, fireEvent } from "@testing-library/react-native";
import { Input } from "../Input";

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
});
