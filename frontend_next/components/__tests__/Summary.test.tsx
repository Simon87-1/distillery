import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Summary from "@/components/summary/Summary";
import WebSocketContext from "@/context/WebSocketContext";

// Mock child components
jest.mock("@/components/summary/SummarySection", () => ({
  __esModule: true,
  default: ({ sections, onItemClick, onDeleteFact, onChangeFeedback }) => (
    <div data-testid="summary-section">
      {sections.map((section) => (
        <div key={section.header}>
          {section.facts.map((fact) => (
            <div key={fact.fact_id}>
              <button onClick={() => onItemClick(fact)}>Select</button>
              <button
                onClick={() => onDeleteFact(fact.fact_id, section.header)}
              >
                Delete
              </button>
              <button
                onClick={() =>
                  onChangeFeedback({
                    header: section.header,
                    id: fact.fact_id,
                    type: "positive",
                  })
                }
              >
                Feedback
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/summary/SourceSection", () => ({
  __esModule: true,
  default: ({ documents, selectedItem, onCloseSelection }) => (
    <div data-testid="source-section">
      <button onClick={onCloseSelection}>Close</button>
    </div>
  ),
}));

jest.mock("../loaders/ProcessingProgress", () => ({
  __esModule: true,
  default: ({ progress }) => (
    <div data-testid="processing-progress">{progress}</div>
  ),
}));

describe("Summary Component", () => {
  const mockDocs = {
    documents: [{ id: "1", content: "Test content" }],
  };

  const mockMessage = {
    sections: [
      {
        header: "Test Header",
        facts: [
          { fact_id: "1", content: "Test fact 1", feedback: null },
          { fact_id: "2", content: "Test fact 2", feedback: null },
        ],
      },
    ],
  };

  const mockWebSocketValue = {
    message: null,
    progress: 0,
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
  };

  const renderComponent = (webSocketValue = mockWebSocketValue) => {
    return render(
      <WebSocketContext.Provider value={webSocketValue}>
        <Summary docs={mockDocs} />
      </WebSocketContext.Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    renderComponent();
    expect(screen.getByTestId("summary-section")).toBeInTheDocument();
    expect(screen.getByTestId("source-section")).toBeInTheDocument();
  });

  test("shows processing progress when progress is not 1", () => {
    const webSocketValue = { ...mockWebSocketValue, progress: 0.5 };
    renderComponent(webSocketValue);
    expect(screen.getByTestId("processing-progress")).toBeInTheDocument();
    expect(screen.getByTestId("processing-progress")).toHaveTextContent("50");
  });

  test("hides processing progress when progress is 1", () => {
    const webSocketValue = { ...mockWebSocketValue, progress: 1 };
    renderComponent(webSocketValue);
    expect(screen.queryByTestId("processing-progress")).not.toBeInTheDocument();
  });

  test("updates facts when message is received", () => {
    const webSocketValue = { ...mockWebSocketValue, message: mockMessage };
    renderComponent(webSocketValue);
    const summarySection = screen.getByTestId("summary-section");
    expect(summarySection).toBeInTheDocument();
  });

  test("handles fact deletion", async () => {
    const webSocketValue = { ...mockWebSocketValue, message: mockMessage };
    renderComponent(webSocketValue);

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      const summarySection = screen.getByTestId("summary-section");
      expect(summarySection).toBeInTheDocument();
    });
  });

  test("handles item selection and deselection", () => {
    const webSocketValue = { ...mockWebSocketValue, message: mockMessage };
    renderComponent(webSocketValue);

    const selectButtons = screen.getAllByText("Select");

    // Select item
    fireEvent.click(selectButtons[0]);
    expect(screen.getByTestId("source-section")).toBeInTheDocument();

    // Deselect same item
    fireEvent.click(selectButtons[0]);
    expect(screen.getByTestId("source-section")).toBeInTheDocument();
  });

  test("handles feedback changes", async () => {
    const webSocketValue = { ...mockWebSocketValue, message: mockMessage };
    renderComponent(webSocketValue);

    const feedbackButtons = screen.getAllByText("Feedback");
    fireEvent.click(feedbackButtons[0]);

    await waitFor(() => {
      const summarySection = screen.getByTestId("summary-section");
      expect(summarySection).toBeInTheDocument();
    });
  });

  test("handles closing selected item", () => {
    const webSocketValue = { ...mockWebSocketValue, message: mockMessage };
    renderComponent(webSocketValue);

    // First select an item
    const selectButtons = screen.getAllByText("Select");
    fireEvent.click(selectButtons[0]);

    // Then close it
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(screen.getByTestId("source-section")).toBeInTheDocument();
  });
});
