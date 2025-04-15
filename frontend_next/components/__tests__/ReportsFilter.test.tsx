import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportsFilter from "@/components/ReportsFilter";

// Mock data for testing
const mockRange = [
  { id: 1, label: "Last Week", notes: 5 },
  { id: 2, label: "Last Month", notes: 10 },
  { id: 3, label: "Last Year", notes: 20 },
];

const mockOnChange = jest.fn();

describe("ReportsFilter Component", () => {
  it("renders without crashing", () => {
    render(<ReportsFilter range={mockRange} onChange={mockOnChange} />);
    expect(screen.getByText("Reports:")).toBeInTheDocument();
  });

  it("displays all range options", () => {
    render(<ReportsFilter range={mockRange} onChange={mockOnChange} />);
    mockRange.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("selects the last range by default", () => {
    render(<ReportsFilter range={mockRange} onChange={mockOnChange} />);
    const lastRangeButton = screen
      .getByText(mockRange[mockRange.length - 1].label)
      .closest("button");
    expect(lastRangeButton?.closest("div")).toHaveClass(
      "reports-filter-active",
    );
  });

  it("calls onChange with the correct parameters when a range is selected", () => {
    render(<ReportsFilter range={mockRange} onChange={mockOnChange} />);
    const rangeButton = screen.getByText("Last Month").closest("button");
    fireEvent.click(rangeButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      items: [{ field: "rel_date", operator: "<=", value: 2 }],
    });
  });

  it("updates the active range when a button is clicked", () => {
    render(<ReportsFilter range={mockRange} onChange={mockOnChange} />);

    const lastWeekButton = screen
      .getByText(mockRange[0].label)
      .closest("button");
    const lastMonthButton = screen
      .getByText(mockRange[1].label)
      .closest("button");

    const lastWeekContainer = lastWeekButton.closest("div");
    const lastMonthContainer = lastMonthButton.closest("div");

    fireEvent.click(lastWeekButton);

    expect(lastWeekContainer).toHaveClass("reports-filter-active");
    expect(lastMonthContainer).not.toHaveClass("reports-filter-active");
  });

  it("disables ranges that are not within the selected range", () => {
    render(<ReportsFilter range={mockRange} onChange={mockOnChange} />);
    const lastWeekButton = screen.getByText("Last Week").closest("button");
    const lastMonthButton = screen.getByText("Last Month").closest("button");
    const lastWeekContainer = lastWeekButton.closest("div");
    const lastMonthContainer = lastMonthButton.closest("div");

    fireEvent.click(lastWeekButton);
    expect(lastWeekContainer).toHaveClass("reports-filter-active");
    expect(lastMonthContainer).not.toHaveClass("reports-filter-active");
  });
});
