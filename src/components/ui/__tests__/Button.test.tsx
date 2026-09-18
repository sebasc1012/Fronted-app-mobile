import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

const scale = () => screen.root!.props.style.transform[0].scale;

describe("Button", () => {
  it("renders the title and calls onPress", async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByText("Continue"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByText("Continue"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows a spinner instead of the title while loading", async () => {
    await render(<Button title="Continue" onPress={() => {}} loading />);
    expect(screen.queryByText("Continue")).toBeNull();
  });

  it("scales down on press and back up on release", async () => {
    await render(<Button title="Continue" onPress={() => {}} />);
    const label = screen.getByText("Continue");

    await fireEvent(label, "pressIn");
    expect(scale()).toBe(0.98);

    await fireEvent(label, "pressOut");
    expect(scale()).toBe(1);
  });

  it("does not scale down on press when disabled", async () => {
    await render(<Button title="Continue" onPress={() => {}} disabled />);
    const label = screen.getByText("Continue");

    await fireEvent(label, "pressIn");
    expect(scale()).toBe(1);
  });

  it("renders the icon node as given, untouched", async () => {
    await render(
      <Button
        title="Continuar con Google"
        onPress={() => {}}
        icon={<Text>logo</Text>}
      />,
    );
    expect(screen.getByText("logo")).toBeTruthy();
  });

  it("renders as a borderless pill with no background for variant='outline' + pill", async () => {
    await render(
      <Button title="Continuar con Google" onPress={() => {}} variant="outline" pill />,
    );
    expect(screen.root!.props.className).toContain("rounded-full");
    expect(screen.root!.props.className).toContain("border");
    expect(screen.root!.props.className).not.toContain("bg-");
  });
});
