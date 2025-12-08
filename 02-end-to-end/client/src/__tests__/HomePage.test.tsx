import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { HomePage } from "../routes/HomePage";
import * as api from "../lib/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../lib/api");

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create and join session options", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Create New Session")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter session ID")).toBeInTheDocument();
    expect(screen.getByText("Join Session")).toBeInTheDocument();
  });

  it("should create a new session and navigate", async () => {
    const mockSession = { sessionId: "new-session-123" };
    vi.mocked(api.createSession).mockResolvedValue(mockSession);

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const createButton = screen.getByText("Create New Session");
    await user.click(createButton);

    await waitFor(() => {
      expect(api.createSession).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/session/new-session-123");
    });
  });

  it("should join session when session ID is entered", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText("Enter session ID");
    const joinButton = screen.getByText("Join Session");

    await user.type(input, "existing-session-456");
    await user.click(joinButton);

    expect(mockNavigate).toHaveBeenCalledWith("/session/existing-session-456");
  });

  it("should join session when Enter is pressed in input", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText("Enter session ID");
    await user.type(input, "session-789{Enter}");

    expect(mockNavigate).toHaveBeenCalledWith("/session/session-789");
  });
});
