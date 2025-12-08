import { useState } from "react";

interface OutputPanelProps {
  output: string[];
  error?: string;
}

export function OutputPanel({ output, error }: OutputPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ddd",
        borderRadius: "4px",
        overflow: "hidden",
        height: isMinimized ? "auto" : "300px",
      }}
    >
      <div
        style={{
          padding: "0.5rem",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>Output</strong>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "white",
          }}
        >
          {isMinimized ? "Expand" : "Minimize"}
        </button>
      </div>
      {!isMinimized && (
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
          }}
        >
          {error && (
            <div style={{ color: "#f48771", marginBottom: "1rem" }}>
              Error: {error}
            </div>
          )}
          {output.length === 0 && !error && (
            <div style={{ color: "#858585" }}>No output yet. Run your code to see results.</div>
          )}
          {output.map((line, index) => (
            <div key={index} style={{ marginBottom: "0.25rem" }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
