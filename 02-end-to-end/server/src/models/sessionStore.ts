import { nanoid } from "nanoid";
import { Session } from "../types";

class SessionStore {
  private sessions: Map<string, Session> = new Map();

  createSession(initialCode: string = "", initialLanguage: string = "javascript"): Session {
    const sessionId = nanoid();
    const session: Session = {
      sessionId,
      code: initialCode,
      language: initialLanguage,
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Invalid sessionId: must be a non-empty string");
    }
    return this.sessions.get(sessionId);
  }

  updateSessionCode(sessionId: string, code: string): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (typeof code !== "string") {
      throw new Error("Code must be a string");
    }
    session.code = code;
    session.updatedAt = new Date();
  }

  updateSessionLanguage(sessionId: string, language: string): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (!language || typeof language !== "string") {
      throw new Error("Language must be a non-empty string");
    }
    session.language = language;
    session.updatedAt = new Date();
  }

  clear(): void {
    this.sessions.clear();
  }
}

export const sessionStore = new SessionStore();
