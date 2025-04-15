import React from "react";
import { render, screen } from "@testing-library/react";
import ProcessingProgress from "@/components/loaders/ProcessingProgress";
import { useWebSocketContext } from "@/context/WebSocketContext";

jest.mock("@/context/WebSocketContext", () => ({
  useWebSocketContext: jest.fn(),
}));

describe("ProcessingProgress", () => {
  it("renders error state correctly", () => {
    (useWebSocketContext as jest.Mock).mockReturnValue({ error: true });
    const { container } = render(<ProcessingProgress progress={50} />);

    expect(
      screen.getByText("Error occurred while loading"),
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders processing state correctly", () => {
    (useWebSocketContext as jest.Mock).mockReturnValue({ error: false });
    render(<ProcessingProgress progress={75} />);
    expect(screen.getByText("Processing Reports")).toBeInTheDocument();
  });

  it("applies correct error styles", () => {
    (useWebSocketContext as jest.Mock).mockReturnValue({ error: true });
    const { container } = render(<ProcessingProgress progress={50} />);
    const progressBar = container.querySelectorAll(".MuiBox-root")[1];
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("applies correct processing styles", () => {
    (useWebSocketContext as jest.Mock).mockReturnValue({ error: false });
    const { container } = render(<ProcessingProgress progress={75} />);
    const progressBar = container.querySelectorAll(".MuiBox-root")[1];
    expect(progressBar).toHaveStyle({ width: "75%" });
  });
});
