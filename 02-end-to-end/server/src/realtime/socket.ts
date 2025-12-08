import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { sessionStore } from "../models/sessionStore";

const SOCKET_EVENTS = {
  JOIN_SESSION: "join-session",
  CODE_CHANGE: "code-change",
  LANGUAGE_CHANGE: "language-change",
  SESSION_STATE: "session-state",
  CODE_UPDATE: "code-update",
  LANGUAGE_UPDATE: "language-update",
} as const;

export function initializeSocket(httpServer: HttpServer) {
  const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173");
  
  const io = new SocketServer(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_SESSION, (data: { sessionId: string }) => {
      try {
        const { sessionId } = data;
        if (!sessionId) {
          socket.emit("error", { message: "sessionId is required" });
          return;
        }

        const session = sessionStore.getSession(sessionId);
        if (!session) {
          socket.emit("error", { message: "Session not found" });
          return;
        }

        socket.join(sessionId);
        console.log(`Client ${socket.id} joined session ${sessionId}`);
        
        socket.emit(SOCKET_EVENTS.SESSION_STATE, {
          code: session.code,
          language: session.language,
        });
      } catch (error) {
        console.error("Error joining session:", error);
        socket.emit("error", { message: "Failed to join session" });
      }
    });

    socket.on(SOCKET_EVENTS.CODE_CHANGE, (data: { sessionId: string; code: string }) => {
      try {
        const { sessionId, code } = data;
        if (!sessionId || typeof code !== "string") {
          socket.emit("error", { message: "Invalid code change data" });
          return;
        }

        sessionStore.updateSessionCode(sessionId, code);
        
        socket.to(sessionId).emit(SOCKET_EVENTS.CODE_UPDATE, {
          code,
        });
      } catch (error) {
        console.error("Error updating code:", error);
        socket.emit("error", { message: "Failed to update code" });
      }
    });

    socket.on(SOCKET_EVENTS.LANGUAGE_CHANGE, (data: { sessionId: string; language: string }) => {
      try {
        const { sessionId, language } = data;
        if (!sessionId || !language) {
          socket.emit("error", { message: "Invalid language change data" });
          return;
        }

        sessionStore.updateSessionLanguage(sessionId, language);
        
        socket.to(sessionId).emit(SOCKET_EVENTS.LANGUAGE_UPDATE, {
          language,
        });
      } catch (error) {
        console.error("Error updating language:", error);
        socket.emit("error", { message: "Failed to update language" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
