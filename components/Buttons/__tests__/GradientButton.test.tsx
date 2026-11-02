import React from "react";
import { render, screen } from "@testing-library/react-native";
import GradientButton from "../GradientButton";

describe("GradientButton", () => {
  it("shows the title when idle", async () => {
    await render(<GradientButton title="Add Project" onPress={() => {}} />);

    expect(screen.getByText("Add Project")).toBeTruthy();
  });

  it("shows the upload label while loading", async () => {
    await render(
      <GradientButton
        title="Add Project"
        onPress={() => {}}
        loading
        loadingText="Uploading..."
      />,
    );

    expect(screen.getByText("Uploading...")).toBeTruthy();
  });

  it("appends the percentage when progress is provided", async () => {
    await render(
      <GradientButton
        title="Add Project"
        onPress={() => {}}
        loading
        loadingText="Uploading..."
        progress={0.42}
      />,
    );

    expect(screen.getByText("Uploading... 42%")).toBeTruthy();
  });
});
