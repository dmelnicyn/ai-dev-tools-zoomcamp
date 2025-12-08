export interface RunnerResult {
  output: string[];
  error?: string;
}

export function createRunnerFrame(container: HTMLElement): HTMLIFrameElement {
  if (!container) {
    throw new Error("Container element is required to create runner iframe");
  }

  const iframe = document.createElement("iframe");
  iframe.src = "/runner.html";
  iframe.sandbox.add("allow-scripts");
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.position = "absolute";
  iframe.style.visibility = "hidden";
  iframe.setAttribute("title", "Code runner iframe");
  
  // Log for debugging
  iframe.onload = () => {
    console.log("Runner iframe onload event fired - iframe should be ready");
  };
  
  iframe.onerror = (error) => {
    console.error("Runner iframe failed to load:", error);
  };
  
  container.appendChild(iframe);
  console.log("Runner iframe created and appended to container");
  
  return iframe;
}

export function sendCodeToRunner(
  iframe: HTMLIFrameElement,
  code: string,
  language: string
): void {
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: "run", code, language }, "*");
  }
}

export function onRunnerResult(
  iframe: HTMLIFrameElement,
  callback: (result: RunnerResult) => void
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) {
      return;
    }
    if (event.data.type === "result") {
      callback({
        output: event.data.output || [],
        error: event.data.error,
      });
    }
  };

  window.addEventListener("message", handler);

  return () => {
    window.removeEventListener("message", handler);
  };
}
