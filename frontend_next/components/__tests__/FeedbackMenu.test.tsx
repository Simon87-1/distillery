import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FeedbackMenu from "@/components/summary/FeedbackMenu";
import { FeedbackOptions } from "@/types/common.types";

describe("FeedbackMenu", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockAnchorEl = document.createElement("div");

  const feedbackOptions: FeedbackOptions[] = [
    { id: "1", label: "Option 1", type: "button" },
    { id: "2", label: "Option 2", type: "button" },
    { id: "3", label: "Additional Comments", type: "textInput" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders feedback menu when anchorEl is provided", () => {
    render(
      <FeedbackMenu
        anchorEl={mockAnchorEl}
        options={feedbackOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText("Leave Feedback")).toBeInTheDocument();
    expect(
      screen.getByText("Help us improve with your feedback"),
    ).toBeInTheDocument();
  });

  it("toggles option selection when clicked", () => {
    render(
      <FeedbackMenu
        anchorEl={mockAnchorEl}
        options={feedbackOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const optionButton = screen.getByText("Option 1");

    fireEvent.click(optionButton);
    expect(optionButton).toHaveClass("bg-light-main font-bold color-main");

    fireEvent.click(optionButton);
    expect(optionButton).not.toHaveClass("bg-light-main font-bold color-main");
  });

  it("calls onSubmit with selected options when 'Submit' is clicked", () => {
    render(
      <FeedbackMenu
        anchorEl={mockAnchorEl}
        options={feedbackOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const optionButton = screen.getByText("Option 1");
    fireEvent.click(optionButton);

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(["1"], false);
  });

  it("calls onSubmit with selected options and delete flag when 'Submit & Delete Fact' is clicked", () => {
    render(
      <FeedbackMenu
        anchorEl={mockAnchorEl}
        options={feedbackOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const optionButton = screen.getByText("Option 2");
    fireEvent.click(optionButton);

    const submitDeleteButton = screen.getByText("Submit & Delete Fact");
    fireEvent.click(submitDeleteButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(["2"], true);
  });

  it("calls onClose when 'Cancel' is clicked", () => {
    render(
      <FeedbackMenu
        anchorEl={mockAnchorEl}
        options={feedbackOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("updates text field when user types", () => {
    render(
      <FeedbackMenu
        anchorEl={mockAnchorEl}
        options={feedbackOptions}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const textField = screen.getByLabelText("Additional Comments");
    fireEvent.change(textField, { target: { value: "Great job!" } });

    expect(textField).toHaveValue("Great job!");
  });
});
