import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../lib/api";

export function HomePage() {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const { sessionId: newSessionId } = await createSession();
      navigate(`/session/${newSessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = () => {
    if (sessionId.trim()) {
      navigate(`/session/${sessionId.trim()}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      <h2>Welcome to Coding Interview Platform</h2>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <button
          onClick={handleCreateSession}
          disabled={loading}
          style={{
            padding: "1rem",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create New Session"}
        </button>

        <div style={{ textAlign: "center", margin: "1rem 0" }}>OR</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
            placeholder="Enter session ID"
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleJoinSession}
            disabled={!sessionId.trim()}
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !sessionId.trim() ? "not-allowed" : "pointer",
            }}
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
}
