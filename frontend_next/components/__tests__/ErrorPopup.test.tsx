import { render, screen, fireEvent } from "@testing-library/react";
import ErrorPopup from "../ErrorPopup";
import React from "react";

describe("ErrorPopup", () => {
  const mockOnClose = jest.fn();

  const renderComponent = (props = {}) => {
    return render(<ErrorPopup open={true} onClose={mockOnClose} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with default message when no message provided", () => {
    renderComponent();
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  test("renders with custom message when provided", () => {
    const message = "Custom error message";
    renderComponent({ message });
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test("calls onClose when close button clicked", () => {
    renderComponent();
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("does not render when open is false", () => {
    renderComponent({ open: false });
    expect(screen.queryByText("Error Occurred")).not.toBeInTheDocument();
  });

  test("renders error title", () => {
    renderComponent();
    expect(screen.getByText("Error Occurred")).toBeInTheDocument();
  });

  test("applies pointer-events style based on open prop", () => {
    const { rerender } = renderComponent({ open: true });
    const container = screen.getByTestId("error-popup");
    expect(container).toHaveStyle({ pointerEvents: "auto" });

    rerender(<ErrorPopup open={false} onClose={mockOnClose} />);
    expect(container).toHaveStyle({ pointerEvents: "none" });
  });
});
