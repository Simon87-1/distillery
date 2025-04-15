import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SummarySectionsFilter from "@/components/SummarySectionsFilter";
import { getSetting, saveSetting } from "@/utils/localStorage";

jest.mock("@/utils/localStorage", () => ({
  getSetting: jest.fn(),
  saveSetting: jest.fn(),
}));

jest.mock("@/utils", () => ({
  factsHeaders: ["Section 1", "Section 2", "Section 3"],
}));

describe("SummarySectionsFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSetting as jest.Mock).mockReturnValue([]);
  });

  it("toggles a section when clicked", async () => {
    render(<SummarySectionsFilter />);

    const button = screen.getByText("Section 1");

    // Click to select
    fireEvent.click(button);

    await waitFor(() => {
      expect(saveSetting).toHaveBeenCalledWith("selectedSections", [
        "Section 1",
      ]);
    });

    expect(button).toHaveClass("bg-light-main font-bold color-main");

    // Click again to deselect
    fireEvent.click(button);

    await waitFor(() => {
      expect(saveSetting).toHaveBeenCalledWith("selectedSections", []);
    });

    expect(button).not.toHaveClass("bg-light-main font-bold color-main");
  });
});
