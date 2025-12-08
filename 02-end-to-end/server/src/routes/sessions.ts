import { Router } from "express";
import { sessionStore } from "../models/sessionStore";

export const sessionsRouter = Router();

sessionsRouter.post("/sessions", (req, res) => {
  try {
    const session = sessionStore.createSession();
    res.status(201).json({ sessionId: session.sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

sessionsRouter.get("/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionStore.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({
      sessionId: session.sessionId,
      language: session.language,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(400).json({ error: "Invalid session ID" });
  }
});
