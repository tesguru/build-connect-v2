import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import EmptyScreenComponent from "../EmptyScreenComponent";

describe("EmptyScreenComponent", () => {
  it("renders the contextual title and description, not the generic message", async () => {
    await render(
      <EmptyScreenComponent
        title="No Bids Found"
        description="Bids you submit on projects will appear here"
      />,
    );

    expect(screen.getByText("No Bids Found")).toBeTruthy();
    expect(
      screen.getByText("Bids you submit on projects will appear here"),
    ).toBeTruthy();
    expect(screen.queryByText("No Data yet")).toBeNull();
  });

  it("falls back to message when no title is given", async () => {
    await render(<EmptyScreenComponent message="No payment instructions" />);

    expect(screen.getByText("No payment instructions")).toBeTruthy();
  });

  it("shows message as the body when a title is present", async () => {
    await render(
      <EmptyScreenComponent
        title="Unable to Load Project"
        message="There was an error loading the project details."
      />,
    );

    expect(screen.getByText("Unable to Load Project")).toBeTruthy();
    expect(
      screen.getByText("There was an error loading the project details."),
    ).toBeTruthy();
  });

  it("fires the call-to-action button", async () => {
    const onPress = jest.fn();
    await render(
      <EmptyScreenComponent
        title="No Properties Found"
        description="Add your first listing"
        buttonText="Add Property"
        onButtonPress={onPress}
      />,
    );

    await fireEvent.press(screen.getByText("Add Property"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
