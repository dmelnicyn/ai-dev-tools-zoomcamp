import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

interface EditorPanelProps {
  value: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
}

export function EditorPanel({
  value,
  language,
  onChange,
  onLanguageChange,
}: EditorPanelProps) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmittedValueRef = useRef<string>(value);

  // Update lastEmittedValueRef when value prop changes (from remote updates)
  useEffect(() => {
    lastEmittedValueRef.current = value;
    // Clear any pending debounce timer when value changes externally
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [value]);

  const handleEditorChange = (newValue: string | undefined) => {
    const code = newValue || "";
    
    // Check against the current lastEmittedValueRef to prevent duplicate emissions
    if (code === lastEmittedValueRef.current) {
      return;
    }

    // Update lastEmittedValueRef immediately to prevent race conditions
    // This ensures subsequent identical changes within 500ms are properly detected
    lastEmittedValueRef.current = code;
    onChange(code);

    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // The debounce timer is no longer needed for lastEmittedValueRef update
    // since we update it immediately above. This timer could be used for other
    // debouncing purposes if needed in the future.
    debounceTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Monaco Editor configuration optimized for JavaScript and Python
  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    wordWrap: "on" as const,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,
    // JavaScript-specific options
    ...(language === "javascript" && {
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
    }),
    // Python-specific options
    ...(language === "python" && {
      tabSize: 4, // Python standard is 4 spaces
      insertSpaces: true,
      formatOnPaste: false, // Python formatting can be complex
    }),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>
        <label>
          Language:{" "}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.9rem",
              marginLeft: "0.5rem",
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={editorOptions}
          loading={<div>Loading editor...</div>}
        />
      </div>
    </div>
  );
}
