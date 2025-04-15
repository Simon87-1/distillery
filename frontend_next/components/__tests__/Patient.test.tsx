import { render, screen, waitFor } from "@testing-library/react";
import Patient from "@/components/Patient";
import { FhirClientContext } from "@/context/FhirClientContext";
import WebSocketContext from "@/context/WebSocketContext";
import { Patient as PatientType } from "@/types/Client.types";
import { jwtDecode } from "jwt-decode";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("@/components/loaders/PatientSkeleton", () => () => (
  <div>Loading...</div>
));

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({
    context: { patient: "1234" },
  })),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    pathname: "/",
  })),
}));

const mockSetError = jest.fn();
const mockClient = {
  state: { tokenResponse: { access_token: "dummy-token" } },
  patient: {
    read: jest.fn(),
  },
};

describe("Patient Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading skeleton initially", () => {
    render(
      <FhirClientContext.Provider value={{ client: mockClient }}>
        <WebSocketContext.Provider value={{ setError: mockSetError }}>
          <Patient />
        </WebSocketContext.Provider>
      </FhirClientContext.Provider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("fetches and renders patient data correctly", async () => {
    const mockPatientData: PatientType = {
      id: "1234",
      name: [{ given: ["John"], family: "Doe", use: "official" }],
      gender: "male",
      birthDate: "1990-01-01",
    };

    mockClient.patient.read.mockResolvedValue(mockPatientData);

    render(
      <FhirClientContext.Provider value={{ client: mockClient }}>
        <WebSocketContext.Provider value={{ setError: mockSetError }}>
          <Patient />
        </WebSocketContext.Provider>
      </FhirClientContext.Provider>,
    );

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument(),
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("ID:1234")).toBeInTheDocument();
    expect(screen.getByText("Gender")).toBeInTheDocument();
    expect(screen.getByText("male")).toBeInTheDocument();
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  });

  it("handles error and calls setError", async () => {
    const error = new Error("Network Error");
    mockClient.patient.read.mockRejectedValue(error);

    render(
      <FhirClientContext.Provider value={{ client: mockClient }}>
        <WebSocketContext.Provider value={{ setError: mockSetError }}>
          <Patient />
        </WebSocketContext.Provider>
      </FhirClientContext.Provider>,
    );

    await waitFor(() =>
      expect(mockSetError).toHaveBeenCalledWith("Network Error"),
    );
  });
});
