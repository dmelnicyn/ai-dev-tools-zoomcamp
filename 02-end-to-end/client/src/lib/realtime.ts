import { io, Socket } from "socket.io-client";
import { SessionState, CodeUpdate, LanguageUpdate } from "../types";

const SOCKET_EVENTS = {
  JOIN_SESSION: "join-session",
  CODE_CHANGE: "code-change",
  LANGUAGE_CHANGE: "language-change",
  SESSION_STATE: "session-state",
  CODE_UPDATE: "code-update",
  LANGUAGE_UPDATE: "language-update",
} as const;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(undefined, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export interface SessionHandlers {
  onCodeUpdate: (update: CodeUpdate) => void;
  onLanguageUpdate: (update: LanguageUpdate) => void;
  onSessionState: (state: SessionState) => void;
  onError?: (error: { message: string }) => void;
}

export function connectToSession(
  sessionId: string,
  handlers: SessionHandlers
): () => void {
  const socketInstance = getSocket();

  socketInstance.emit(SOCKET_EVENTS.JOIN_SESSION, { sessionId });

  socketInstance.on(SOCKET_EVENTS.SESSION_STATE, handlers.onSessionState);
  socketInstance.on(SOCKET_EVENTS.CODE_UPDATE, handlers.onCodeUpdate);
  socketInstance.on(SOCKET_EVENTS.LANGUAGE_UPDATE, handlers.onLanguageUpdate);

  if (handlers.onError) {
    socketInstance.on("error", handlers.onError);
  }

  return () => {
    socketInstance.off(SOCKET_EVENTS.SESSION_STATE, handlers.onSessionState);
    socketInstance.off(SOCKET_EVENTS.CODE_UPDATE, handlers.onCodeUpdate);
    socketInstance.off(SOCKET_EVENTS.LANGUAGE_UPDATE, handlers.onLanguageUpdate);
    if (handlers.onError) {
      socketInstance.off("error", handlers.onError);
    }
  };
}

export function emitCodeChange(sessionId: string, code: string): void {
  const socketInstance = getSocket();
  socketInstance.emit(SOCKET_EVENTS.CODE_CHANGE, { sessionId, code });
}

export function emitLanguageChange(sessionId: string, language: string): void {
  const socketInstance = getSocket();
  socketInstance.emit(SOCKET_EVENTS.LANGUAGE_CHANGE, { sessionId, language });
}

export function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
