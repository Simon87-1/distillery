import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentList from "@/components/DocumentList";
import { FhirClientContext } from "@/context/FhirClientContext";
import WebSocketContext from "@/context/WebSocketContext";
import { useRouter } from "next/router";

jest.mock("@mui/x-data-grid", () => ({
  DataGrid: ({ rows }) => (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-testid="report-row">
            <td>{row.category}</td>
            <td>{row.date_time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  useGridApiRef: jest.fn(() => ({})),
}));

jest.mock("@/utils/localStorage", () => ({
  getSetting: jest.fn(() => []),
  saveSetting: jest.fn(),
}));

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockRouterPush = jest.fn();
useRouter.mockReturnValue({ push: mockRouterPush });

describe("DocumentList Component", () => {
  const mockSetError = jest.fn();
  const mockClient = {
    request: jest.fn(async () => []),
    getPatientId: jest.fn(() => "patient-123"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <FhirClientContext.Provider
        value={{ client: mockClient, patientId: "patient-123" }}
      >
        <WebSocketContext.Provider value={{ setError: mockSetError }}>
          <DocumentList />
        </WebSocketContext.Provider>
      </FhirClientContext.Provider>,
    );
  };

  test("renders loading state", async () => {
    renderComponent();
    expect(screen.queryByTestId("skeleton-loader")).toBeInTheDocument();
    await waitFor(() => expect(mockClient.request).toHaveBeenCalled());
  });

  test("handles report selection and navigation", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.queryAllByTestId("report-row")).toHaveLength(0),
    );

    fireEvent.click(screen.getByText("Process 0 Reports"));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
