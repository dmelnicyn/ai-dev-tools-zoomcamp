import { useState } from "react";

interface ToolbarProps {
  sessionId: string;
  language: string;
  onRun: () => void;
  canRun: boolean;
}

export function Toolbar({ sessionId, language: _language, onRun, canRun }: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const sessionUrl = `${window.location.origin}/session/${sessionId}`;

  return (
    <div
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <strong>Session ID:</strong>
        <code
          style={{
            padding: "0.25rem 0.5rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "0.9rem",
          }}
        >
          {sessionId}
        </code>
        <button
          onClick={() => copyToClipboard(sessionId)}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "white",
          }}
        >
          {copied ? "Copied!" : "Copy ID"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          onClick={() => copyToClipboard(sessionUrl)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.9rem",
            border: "1px solid #007bff",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#007bff",
          }}
        >
          {copied ? "Link Copied!" : "Copy Share Link"}
        </button>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {!canRun && (
          <span style={{ fontSize: "0.9rem", color: "#666", marginRight: "0.5rem" }}>
            Note: Only JavaScript and Python can be executed
          </span>
        )}
        <button
          onClick={onRun}
          disabled={!canRun}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            backgroundColor: canRun ? "#28a745" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: canRun ? "pointer" : "not-allowed",
          }}
        >
          Run Code
        </button>
      </div>
    </div>
  );
}
