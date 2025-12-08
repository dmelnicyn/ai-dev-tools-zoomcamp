import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SessionPage } from "../routes/SessionPage";
import * as api from "../lib/api";

vi.mock("../lib/api");
vi.mock("../lib/realtime", () => ({
  connectToSession: vi.fn(() => () => {}),
  emitCodeChange: vi.fn(),
  emitLanguageChange: vi.fn(),
}));
vi.mock("../lib/runnerMessaging", () => ({
  createRunnerFrame: vi.fn(() => document.createElement("iframe")),
  sendCodeToRunner: vi.fn(),
  onRunnerResult: vi.fn(() => () => {}),
}));

describe("SessionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(api.getSession).mockImplementation(
      () =>
        new Promise(() => {})
    );

    render(
      <MemoryRouter initialEntries={["/session/test-session-123"]}>
        <SessionPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading session...")).toBeInTheDocument();
  });

  it("should render session page after loading", async () => {
    const mockSession = {
      sessionId: "test-session-123",
      language: "javascript",
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(api.getSession).mockResolvedValue(mockSession);

    render(
      <MemoryRouter initialEntries={["/session/test-session-123"]}>
        <SessionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading session...")).not.toBeInTheDocument();
    });

    expect(api.getSession).toHaveBeenCalledWith("test-session-123");
  });

  it("should display error when session is not found", async () => {
    vi.mocked(api.getSession).mockRejectedValue(new Error("Session not found"));

    render(
      <MemoryRouter initialEntries={["/session/invalid-session"]}>
        <SessionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Session not found/i)).toBeInTheDocument();
    });
  });
});
