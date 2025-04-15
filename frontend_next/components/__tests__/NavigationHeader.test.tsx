import { render, screen, fireEvent } from "@testing-library/react";
import NavigationHeader from "../NavigationHeader";
import { useRouter } from "next/router";
import { useWebSocketContext } from "@/context/WebSocketContext";
import React from "react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/context/WebSocketContext", () => ({
  useWebSocketContext: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe("NavigationHeader", () => {
  const mockRouter = {
    pathname: "/",
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useWebSocketContext as jest.Mock).mockReturnValue({ status: "open" });
  });

  test("renders logo", () => {
    render(<NavigationHeader />);
    expect(screen.getByAltText("Pentavere Logo")).toBeInTheDocument();
  });

  test("shows back button only on documents page", () => {
    const { rerender } = render(<NavigationHeader />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();

    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: "/documents",
    });
    rerender(<NavigationHeader />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  test("back button calls router.back", () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: "/documents",
    });
    render(<NavigationHeader />);
    fireEvent.click(screen.getByText("Back"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("shows green status when websocket is open", () => {
    render(<NavigationHeader />);
    const statusDiv = screen.getByText("DARWEN AI Status").parentElement;
    expect(statusDiv).toHaveClass("color-main");
  });

  test("shows red status when websocket is closed", () => {
    (useWebSocketContext as jest.Mock).mockReturnValue({ status: "closed" });
    render(<NavigationHeader />);
    const statusDiv = screen.getByText("DARWEN AI Status").parentElement;
    expect(statusDiv).toHaveClass("text-red");
  });

  test("renders logout button", () => {
    render(<NavigationHeader />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
