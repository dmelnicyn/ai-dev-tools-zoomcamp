import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EditorPanel } from "../components/EditorPanel";
import { OutputPanel } from "../components/OutputPanel";
import { Toolbar } from "../components/Toolbar";
import { getSession } from "../lib/api";
import { connectToSession, emitCodeChange, emitLanguageChange } from "../lib/realtime";
import {
  createRunnerFrame,
  sendCodeToRunner,
} from "../lib/runnerMessaging";

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | undefined>();

  const runnerFrameRef = useRef<HTMLIFrameElement | null>(null);
  const cleanupSocketRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isApplyingRemoteUpdateRef = useRef(false);
  const runnerReadyRef = useRef(false);
  // Refs to track latest code and language values (to avoid stale closures in async callbacks)
  const codeRef = useRef<string>(code);
  const languageRef = useRef<string>(language);

  // Keep refs in sync with state so async callbacks can access latest values
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Initialize runner iframe - separate effect to ensure containerRef is available
  useEffect(() => {
    // Track timeout and fallback timeout for cleanup
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let iframeElement: HTMLIFrameElement | null = null;
    
    // CRITICAL: Set up message handler that can handle messages even before iframe is assigned to ref
    // Store iframe reference in closure to avoid race conditions
    const handleMessage = (event: MessageEvent) => {
      // Check if message is from our iframe (check both ref and closure variable)
      const iframeWindow = iframeElement?.contentWindow || runnerFrameRef.current?.contentWindow;
      if (!iframeWindow) {
        // Iframe not created yet, ignore messages
        return;
      }

      // Only process messages from our iframe
      if (event.source !== iframeWindow) {
        return;
      }

      console.log("Received message from iframe:", event.data.type, event.data);

      if (event.data.type === "ready" || event.data.type === "pyodide-ready") {
        console.log("Runner iframe is ready");
        // Clear fallback timeout since we received the actual ready message
        if (fallbackTimeoutId) {
          clearTimeout(fallbackTimeoutId);
          fallbackTimeoutId = null;
        }
        runnerReadyRef.current = true;
      } else if (event.data.type === "result") {
        setOutput(event.data.output || []);
        setError(event.data.error);
      } else if (event.data.type === "pyodide-error") {
        console.error("Pyodide initialization error:", event.data.error);
        setError(`Pyodide initialization failed: ${event.data.error}`);
      }
    };

    // Register message handler immediately (before iframe creation)
    window.addEventListener("message", handleMessage);
    console.log("Message handler registered");
    
    // Function to initialize the iframe
    const initializeIframe = () => {
      // Wait for containerRef to be available
      if (!containerRef.current) {
        console.log("ContainerRef not available yet, will retry...");
        return false;
      }

      // Don't recreate if already exists
      if (runnerFrameRef.current) {
        console.log("Runner iframe already exists");
        return true;
      }

      try {
        console.log("Creating runner iframe...");
        iframeElement = createRunnerFrame(containerRef.current);
        runnerFrameRef.current = iframeElement;
        console.log("Runner iframe created successfully");
        
        // Fallback check: If ready message isn't received after 2 seconds but iframe is loaded,
        // mark as ready anyway (for JavaScript, Python still needs Pyodide)
        // Only set fallback if we haven't already received a ready message
        fallbackTimeoutId = setTimeout(() => {
          if ((iframeElement?.contentWindow || runnerFrameRef.current?.contentWindow) && !runnerReadyRef.current) {
            console.warn("Fallback: Assuming iframe is ready (ready message not received)");
            runnerReadyRef.current = true;
          }
        }, 2000);
        
        return true;
      } catch (error) {
        console.error("Failed to create runner iframe:", error);
        setError(`Failed to initialize code runner: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      }
    };

    // Try to initialize immediately
    if (!initializeIframe()) {
      // If containerRef not ready, try again after a short delay
      timeoutId = setTimeout(() => {
        if (initializeIframe()) {
          console.log("Runner iframe initialized after delay");
        }
      }, 100);
    }

    // Single cleanup function that handles all cases
    return () => {
      // Clear any pending timeouts
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
      }
      
      // Remove message listener
      window.removeEventListener("message", handleMessage);
      
      // Clean up iframe if it exists (check both ref and closure variable)
      const iframeToRemove = runnerFrameRef.current || iframeElement;
      if (iframeToRemove && containerRef.current) {
        try {
          containerRef.current.removeChild(iframeToRemove);
        } catch (e) {
          // Ignore if already removed
        }
        runnerFrameRef.current = null;
        iframeElement = null;
      }
      
      // Reset ready state
      runnerReadyRef.current = false;
    };
  }, []); // Empty deps - run once on mount

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    let mounted = true;

    const initializeSession = async () => {
      try {
        const session = await getSession(sessionId);
        if (!mounted) return;

        setLanguage(session.language);

        cleanupSocketRef.current = connectToSession(sessionId, {
          onSessionState: (state) => {
            if (!mounted) return;
            isApplyingRemoteUpdateRef.current = true;
            setCode(state.code);
            setLanguage(state.language);
            setTimeout(() => {
              isApplyingRemoteUpdateRef.current = false;
            }, 100);
          },
          onCodeUpdate: (update) => {
            if (!mounted || isApplyingRemoteUpdateRef.current) return;
            isApplyingRemoteUpdateRef.current = true;
            setCode(update.code);
            setTimeout(() => {
              isApplyingRemoteUpdateRef.current = false;
            }, 100);
          },
          onLanguageUpdate: (update) => {
            if (!mounted) return;
            setLanguage(update.language);
          },
          onError: (err) => {
            if (!mounted) return;
            console.error("Socket error:", err);
            setSessionError(err.message);
          },
        });

        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load session:", err);
        setSessionError("Session not found");
        setLoading(false);
      }
    };

    initializeSession();


    return () => {
      mounted = false;
      if (cleanupSocketRef.current) {
        cleanupSocketRef.current();
      }
    };
  }, [sessionId, navigate]);

  const handleCodeChange = (newCode: string) => {
    if (isApplyingRemoteUpdateRef.current) return;
    setCode(newCode);
    if (sessionId) {
      emitCodeChange(sessionId, newCode);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (sessionId) {
      emitLanguageChange(sessionId, newLanguage);
    }
  };

  const handleRun = () => {
    console.log("handleRun called", {
      hasFrame: !!runnerFrameRef.current,
      isReady: runnerReadyRef.current,
      language,
    });

    const executableLanguages = ["javascript", "python"];
    if (!executableLanguages.includes(language)) {
      setError(`Language "${language}" is not supported for execution. Only JavaScript and Python are supported.`);
      return;
    }

    // For JavaScript, the iframe should be ready quickly, but still check
    // For Python, we need to wait for Pyodide to initialize
    if (!runnerReadyRef.current) {
      console.warn("Runner not ready yet, waiting...", { language });
      // Give it a moment to initialize
      // Note: We read from refs inside checkReady to get the latest code/language values,
      // not the stale values from when handleRun was called
      const checkReady = (attempts: number = 0) => {
        if (runnerFrameRef.current && runnerReadyRef.current) {
          console.log("Runner is now ready, executing code");
          setOutput([]);
          setError(undefined);
          // Read current code and language from refs to avoid stale closure values
          sendCodeToRunner(runnerFrameRef.current, codeRef.current, languageRef.current);
        } else if (!runnerFrameRef.current) {
          console.error("Runner iframe is null after waiting");
          setError("Code runner is not initialized. Please refresh the page.");
        } else if (attempts < 15) {
          setTimeout(() => checkReady(attempts + 1), 200);
        } else {
          console.error("Runner timeout after waiting", {
            hasFrame: !!runnerFrameRef.current,
            isReady: runnerReadyRef.current,
          });
          setError("Code runner is taking longer than expected to load. Please refresh the page.");
        }
      };
      checkReady();
      return;
    }

    if (!runnerFrameRef.current) {
      console.error("Runner iframe not initialized");
      setError("Code runner is not ready. Please refresh the page.");
      return;
    }
    
    setOutput([]);
    setError(undefined);
    
    try {
      // Read current code and language from refs to ensure we use the latest values,
      // not stale closure values (consistent with the checkReady path above)
      console.log("Sending code to runner", { 
        language: languageRef.current, 
        codeLength: codeRef.current.length 
      });
      sendCodeToRunner(runnerFrameRef.current, codeRef.current, languageRef.current);
    } catch (error) {
      console.error("Error sending code to runner:", error);
      setError(`Failed to execute code: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading session...</div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "red", marginBottom: "1rem" }}>{sessionError}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 80px)",
      }}
    >
      <Toolbar
        sessionId={sessionId!}
        language={language}
        onRun={handleRun}
        canRun={language === "javascript" || language === "python"}
      />
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <EditorPanel
            value={code}
            language={language}
            onChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
          />
        </div>
        <div
          style={{
            width: "400px",
            padding: "1rem",
            borderLeft: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            overflowY: "auto",
          }}
        >
          <OutputPanel output={output} error={error} />
        </div>
      </div>
      <div ref={containerRef} style={{ display: "none" }} />
    </div>
  );
}
