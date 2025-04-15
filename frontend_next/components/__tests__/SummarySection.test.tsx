import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import SummarySection from "@/components/summary/SummarySection";
import WebSocketContext from "@/context/WebSocketContext";
import { saveSetting, getSetting } from "@/utils/localStorage";

// Mock the localStorage utility functions
jest.mock("@/utils/localStorage", () => ({
  saveSetting: jest.fn(),
  getSetting: jest.fn(),
}));

// Mock GlossySkeleton component
jest.mock("@/components/loaders/GlossySkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="glossy-skeleton">Loading...</div>,
}));

// Mock FeedbackMenu component with unique testids
jest.mock("@/components/summary/FeedbackMenu", () => ({
  __esModule: true,
  default: ({ type, anchorEl, onSubmit, onClose }) => {
    // Only render if there's an anchor element
    if (!anchorEl) return null;

    return (
      <div data-testid={`feedback-menu-${type || "fact"}`}>
        <button onClick={() => onSubmit(["some-feedback"], false)}>
          Submit Feedback
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

// Mock ProblemItem component
jest.mock("@/components/summary/ProblemItem", () => ({
  __esModule: true,
  default: ({ item, onSetFeedback, onSetAnchorEl }) => (
    <div data-testid={`problem-item-${item.fact_id}`}>
      <span>{item.content}</span>
      <button onClick={() => onSetFeedback("like")}>Like</button>
      <button onClick={() => onSetFeedback("dislike")}>Dislike</button>
      <button onClick={(e) => onSetAnchorEl(e.currentTarget)}>Open Menu</button>
    </div>
  ),
}));

describe("SummarySection Component", () => {
  const mockSections = [
    {
      header: "Test Section 1",
      facts: [
        { fact_id: "1", content: "Fact 1", feedback: null },
        { fact_id: "2", content: "Fact 2", feedback: null },
      ],
    },
    {
      header: "Test Section 2",
      facts: [{ fact_id: "3", content: "Fact 3", feedback: null }],
    },
  ];

  const defaultProps = {
    sections: mockSections,
    selectedItem: null,
    onDeleteFact: jest.fn(),
    onItemClick: jest.fn(),
    onChangeFeedback: jest.fn(),
  };

  const mockWebSocketValue = {
    progress: 1,
    message: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
  };

  const renderComponent = (
    props = defaultProps,
    wsValue = mockWebSocketValue,
  ) => {
    return render(
      <WebSocketContext.Provider value={wsValue}>
        <SummarySection {...props} />
      </WebSocketContext.Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    test("shows skeleton loader when progress is not 1", () => {
      renderComponent(defaultProps, { ...mockWebSocketValue, progress: 0.5 });
      expect(screen.getByTestId("glossy-skeleton")).toBeInTheDocument();
    });

    test("shows content when progress is 1", () => {
      renderComponent();
      expect(screen.queryByTestId("glossy-skeleton")).not.toBeInTheDocument();
      expect(screen.getByText("SUMMARY")).toBeInTheDocument();
    });
  });

  describe("Fact Interaction", () => {
    test("selects fact when clicked", () => {
      renderComponent();
      const fact = screen.getByTestId("problem-item-1");
      fireEvent.click(fact);
      expect(defaultProps.onItemClick).toHaveBeenCalled();
    });

    test("opens fact menu when menu button clicked", () => {
      renderComponent();
      const fact = screen.getByTestId("problem-item-1");
      const menuButton = within(fact).getByText("Open Menu");
      fireEvent.click(fact); // Select the fact first
      fireEvent.click(menuButton);
      expect(screen.getByTestId("feedback-menu-fact")).toBeInTheDocument();
    });

    test("submits fact feedback", () => {
      renderComponent();
      const fact = screen.getByTestId("problem-item-1");
      const likeButton = within(fact).getByText("Like");
      fireEvent.click(likeButton);
      expect(defaultProps.onChangeFeedback).toHaveBeenCalledWith({
        header: "Test Section 1",
        id: "1",
        type: "like",
      });
    });
  });

  describe("General Feedback", () => {
    test("opens like feedback menu", () => {
      renderComponent();
      const buttons = screen.getAllByRole("button");
      const likeButton = buttons[0]; // First button is like
      fireEvent.click(likeButton);
      expect(screen.getByTestId("feedback-menu-like")).toBeInTheDocument();
    });

    test("opens dislike feedback menu", () => {
      renderComponent();
      const buttons = screen.getAllByRole("button");
      const dislikeButton = buttons[1]; // Second button is dislike
      fireEvent.click(dislikeButton);
      expect(screen.getByTestId("feedback-menu-dislike")).toBeInTheDocument();
    });
  });

  describe("Section Management", () => {
    beforeEach(() => {
      (getSetting as jest.Mock).mockReturnValue(["Test Section 1"]);
    });

    test("opens section filter menu", () => {
      renderComponent();
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons[2]; // Third button is menu
      fireEvent.click(menuButton);

      const modifySectionsButton = screen.getByText("Modify sections");
      fireEvent.click(modifySectionsButton);

      expect(screen.getByText("Select summary sections:")).toBeInTheDocument();
    });

    test("saves section filters", () => {
      renderComponent();
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons[2];
      fireEvent.click(menuButton);

      const modifySectionsButton = screen.getByText("Modify sections");
      fireEvent.click(modifySectionsButton);

      const submitButton = screen.getByText("Submit");
      fireEvent.click(submitButton);

      expect(saveSetting).toHaveBeenCalled();
    });

    test("loads saved section filters", () => {
      renderComponent();
      expect(getSetting).toHaveBeenCalledWith("selectedSections");
    });
  });
});
