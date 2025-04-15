import { render, screen, fireEvent } from "@testing-library/react";
import SourceSection from "@/components/summary/SourceSection";
import WebSocketContext from "@/context/WebSocketContext";
import { SourceDocuments } from "@/types/common.types";
import React from "react";
import { Fact } from "@/types/Message.types";

jest.mock("@/utils/handleFactRender", () => jest.fn());

const mockDocuments: SourceDocuments = {
  1: {
    id: 1,
    category: "News",
    performer: "John Doe",
    date: "01/15/2024",
    data: "Sample data",
    content_type: "text",
  },
  2: {
    id: 2,
    category: "Report",
    performer: "Jane Smith",
    date: "02/01/2024",
    data: "More sample data",
    content_type: "text",
  },
};

const mockSelectedFact: Fact = {
  fact_id: "fact-123",
  text: "Sample fact",
  section_name: "Sample Section",
  references: [
    {
      document_id: 1,
      offsets: [0, 10],
      reference_text: "Reference text example",
      bounding_boxes: null,
    },
    {
      document_id: 2,
      offsets: [5, 15],
      reference_text: "Another reference text",
      bounding_boxes: null,
    },
  ],
  confidence_score: 0.95,
  feedback: null,
};

describe("SourceSection Component", () => {
  test("renders tabs and processed documents table", () => {
    render(
      <WebSocketContext.Provider
        value={{
          progress: 1,
          status: "connecting",
          webSocketRef: { current: null },
          message: null,
          error: null,
          setMessage: jest.fn(),
          setStatus: jest.fn(),
          setProgress: jest.fn(),
          setError: jest.fn(),
        }}
      >
        <SourceSection
          documents={mockDocuments}
          selectedItem={null}
          onCloseSelection={jest.fn()}
        />
      </WebSocketContext.Provider>,
    );

    expect(screen.getByText("PROCESSED DOCUMENTS")).toBeInTheDocument();
    expect(screen.getByText("SOURCE")).toBeInTheDocument();

    const johnDoeElements = screen.getAllByText("John Doe");
    expect(johnDoeElements).toHaveLength(3);

    const janeSmithElements = screen.getAllByText("Jane Smith");
    expect(janeSmithElements).toHaveLength(3);
  });

  test("switches tabs on click", () => {
    render(
      <WebSocketContext.Provider
        value={{
          progress: 1,
          status: "connecting",
          webSocketRef: { current: null },
          message: null,
          error: null,
          setMessage: jest.fn(),
          setStatus: jest.fn(),
          setProgress: jest.fn(),
          setError: jest.fn(),
        }}
      >
        <SourceSection
          documents={mockDocuments}
          selectedItem={null}
          onCloseSelection={jest.fn()}
        />
      </WebSocketContext.Provider>,
    );

    const sourceTab = screen.getByText("SOURCE");
    fireEvent.click(sourceTab);
    expect(sourceTab).toHaveClass("Mui-selected");
  });

  test("displays selected fact details", () => {
    render(
      <WebSocketContext.Provider
        value={{
          progress: 1,
          status: "connecting",
          webSocketRef: { current: null },
          message: null,
          error: null,
          setMessage: jest.fn(),
          setStatus: jest.fn(),
          setProgress: jest.fn(),
          setError: jest.fn(),
        }}
      >
        <SourceSection
          documents={mockDocuments}
          selectedItem={mockSelectedFact}
          onCloseSelection={jest.fn()}
        />
      </WebSocketContext.Provider>,
    );

    expect(screen.getByText("Sample fact")).toBeInTheDocument();
    expect(screen.getByText("2 references in 2 documents")).toBeInTheDocument();
  });

  test("calls onCloseSelection when close button is clicked", () => {
    const onCloseSelectionMock = jest.fn();
    render(
      <WebSocketContext.Provider
        value={{
          progress: 1,
          status: "connecting",
          webSocketRef: { current: null },
          message: null,
          error: null,
          setMessage: jest.fn(),
          setStatus: jest.fn(),
          setProgress: jest.fn(),
          setError: jest.fn(),
        }}
      >
        <SourceSection
          documents={mockDocuments}
          selectedItem={mockSelectedFact}
          onCloseSelection={onCloseSelectionMock}
        />
      </WebSocketContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText("close"));
    expect(onCloseSelectionMock).toHaveBeenCalled();
  });
});
