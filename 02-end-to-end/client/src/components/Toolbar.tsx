import { useState, useRef, useEffect } from "react";

interface ToolbarProps {
  sessionId: string;
  language: string;
  onRun: () => void;
  canRun: boolean;
}

export function Toolbar({ sessionId, language: _language, onRun, canRun }: ToolbarProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const idTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const linkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure timeouts are cleared on unmount
  useEffect(() => {
    return () => {
      if (idTimeoutRef.current) clearTimeout(idTimeoutRef.current);
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
    };
  }, []);

  const copyToClipboard = async (
    text: string,
    setCopiedState: React.Dispatch<React.SetStateAction<boolean>>,
    timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopiedState(false), 2000);
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
          onClick={() => copyToClipboard(sessionId, setCopiedId, idTimeoutRef)}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "white",
          }}
        >
          {copiedId ? "Copied!" : "Copy ID"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          onClick={() => copyToClipboard(sessionUrl, setCopiedLink, linkTimeoutRef)}
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
          {copiedLink ? "Link Copied!" : "Copy Share Link"}
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
