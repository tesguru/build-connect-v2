import { fireEvent, render } from "@testing-library/react-native";
import PrimaryButton from "../Button";

describe("PrimaryButton", () => {
  it("renders its label and calls onPress", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <PrimaryButton title="Continue" onPress={onPress} />,
    );

    const label = getByText("Continue");
    expect(label).toBeTruthy();

    await fireEvent.press(label);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <PrimaryButton title="Continue" onPress={onPress} disabled />,
    );

    await fireEvent.press(getByText("Continue"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows the loading state and ignores presses", async () => {
    const onPress = jest.fn();
    const { getByText, queryByText } = await render(
      <PrimaryButton title="Continue" onPress={onPress} loading />,
    );

    expect(getByText("Loading...")).toBeTruthy();
    expect(queryByText("Continue")).toBeNull();

    await fireEvent.press(getByText("Loading..."));
    expect(onPress).not.toHaveBeenCalled();
  });
});
