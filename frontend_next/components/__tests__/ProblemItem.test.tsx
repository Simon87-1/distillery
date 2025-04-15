import { render, screen, fireEvent } from "@testing-library/react";
import ProblemItem from "@/components/summary/ProblemItem";
import { Fact } from "@/types/Message.types";
import { Feedback } from "@/types/common.types";
import React from "react";

const mockItem: Fact = {
  fact_id: "1",
  text: "This is a test fact",
  section_name: "General",
  references: [],
  confidence_score: null,
  feedback: null,
};

describe("ProblemItem", () => {
  let mockSetFeedback: jest.Mock;
  let mockSetAnchorEl: jest.Mock;
  let mockSaveFeedback: jest.Mock;

  beforeEach(() => {
    mockSetFeedback = jest.fn();
    mockSetAnchorEl = jest.fn();
    mockSaveFeedback = jest.fn();
  });

  test("renders the item text", () => {
    render(
      <ProblemItem
        item={mockItem}
        selectedProblem={null}
        anchorEl={null}
        onSetFeedback={mockSetFeedback}
        onSetAnchorEl={mockSetAnchorEl}
        onSaveCurrentFeedback={mockSaveFeedback}
      />,
    );

    expect(screen.getByText(mockItem.text)).toBeInTheDocument();
  });

  test("shows feedback buttons on hover", async () => {
    render(
      <ProblemItem
        item={mockItem}
        selectedProblem={null}
        anchorEl={null}
        onSetFeedback={mockSetFeedback}
        onSetAnchorEl={mockSetAnchorEl}
        onSaveCurrentFeedback={mockSaveFeedback}
      />,
    );

    const problemItem = screen.getByText(mockItem.text).closest("div");
    expect(problemItem).toBeInTheDocument();

    // Initially, like/dislike buttons should not be visible
    expect(
      screen.queryByRole("button", { name: /like/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dislike/i }),
    ).not.toBeInTheDocument();

    // Hover over the item
    fireEvent.mouseEnter(problemItem!);

    // Now the buttons should be visible within the specific context
    const buttonsContainer = screen
      .getByText(mockItem.text)
      .closest("div")?.nextElementSibling;
    const likeButton = buttonsContainer?.querySelector(
      'button[aria-label="like"]',
    );
    const dislikeButton = buttonsContainer?.querySelector(
      'button[aria-label="dislike"]',
    );

    expect(likeButton).toBeInTheDocument();
    expect(dislikeButton).toBeInTheDocument();
  });

  test("handles like button click", () => {
    render(
      <ProblemItem
        item={mockItem}
        selectedProblem={null}
        anchorEl={null}
        onSetFeedback={mockSetFeedback}
        onSetAnchorEl={mockSetAnchorEl}
        onSaveCurrentFeedback={mockSaveFeedback}
      />,
    );

    // Ensure problem item is present and trigger hover
    const problemItem = screen.getByText(mockItem.text).closest("div");
    expect(problemItem).toBeInTheDocument();
    fireEvent.mouseEnter(problemItem!);

    // Find like button more specifically
    const likeButton = screen.getByLabelText("like");
    expect(likeButton).toBeInTheDocument();

    // Perform click and verify only mockSetFeedback is called
    fireEvent.click(likeButton);
    expect(mockSetFeedback).toHaveBeenCalledWith("like");

    // Remove the expect for onSetAnchorEl since it's not called in handleLike
  });

  test("handles dislike button click", () => {
    render(
      <ProblemItem
        item={mockItem}
        selectedProblem={null}
        anchorEl={null}
        onSetFeedback={mockSetFeedback}
        onSetAnchorEl={mockSetAnchorEl}
        onSaveCurrentFeedback={mockSaveFeedback}
      />,
    );

    fireEvent.mouseEnter(screen.getByText(mockItem.text));
    const dislikeButton = screen.getByRole("button", { name: /dislike/i });

    fireEvent.click(dislikeButton);
    expect(mockSaveFeedback).toHaveBeenCalledWith(mockItem);
    expect(mockSetAnchorEl).toHaveBeenCalled();
  });

  test("removes feedback when clicked again", () => {
    const likedItem = { ...mockItem, feedback: "like" as Feedback };

    render(
      <ProblemItem
        item={likedItem}
        selectedProblem={null}
        anchorEl={null}
        onSetFeedback={mockSetFeedback}
        onSetAnchorEl={mockSetAnchorEl}
        onSaveCurrentFeedback={mockSaveFeedback}
      />,
    );

    fireEvent.mouseEnter(screen.getByText(likedItem.text));
    const likeButton = screen.getByLabelText(/like/i);

    fireEvent.click(likeButton);
    expect(mockSetFeedback).toHaveBeenCalledWith(null);
  });
});
