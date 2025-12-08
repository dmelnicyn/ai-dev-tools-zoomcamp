import { sessionStore } from "../models/sessionStore";

describe("SessionStore", () => {
  beforeEach(() => {
    sessionStore.clear();
  });

  describe("createSession", () => {
    it("should create a new session with default values", () => {
      const session = sessionStore.createSession();
      
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(typeof session.sessionId).toBe("string");
      expect(session.code).toBe("");
      expect(session.language).toBe("javascript");
      expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a session with custom initial values", () => {
      const session = sessionStore.createSession("console.log('hello')", "typescript");
      
      expect(session.code).toBe("console.log('hello')");
      expect(session.language).toBe("typescript");
    });

    it("should generate unique session IDs", () => {
      const session1 = sessionStore.createSession();
      const session2 = sessionStore.createSession();
      
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });
  });

  describe("getSession", () => {
    it("should return session if it exists", () => {
      const created = sessionStore.createSession("test code", "python");
      const retrieved = sessionStore.getSession(created.sessionId);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe(created.sessionId);
      expect(retrieved?.code).toBe("test code");
      expect(retrieved?.language).toBe("python");
    });

    it("should return undefined if session does not exist", () => {
      const result = sessionStore.getSession("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should throw error for invalid sessionId", () => {
      expect(() => sessionStore.getSession("")).toThrow("Invalid sessionId");
      expect(() => sessionStore.getSession(null as any)).toThrow("Invalid sessionId");
    });
  });

  describe("updateSessionCode", () => {
    it("should update session code", () => {
      const session = sessionStore.createSession("old code", "javascript");
      const originalUpdatedAt = session.updatedAt;
      
      sessionStore.updateSessionCode(session.sessionId, "new code");
      
      const updated = sessionStore.getSession(session.sessionId);
      expect(updated?.code).toBe("new code");
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it("should throw error if session does not exist", () => {
      expect(() => {
        sessionStore.updateSessionCode("nonexistent", "code");
      }).toThrow("Session not found");
    });

    it("should throw error if code is not a string", () => {
      const session = sessionStore.createSession();
      expect(() => {
        sessionStore.updateSessionCode(session.sessionId, null as any);
      }).toThrow("Code must be a string");
    });
  });

  describe("updateSessionLanguage", () => {
    it("should update session language", () => {
      const session = sessionStore.createSession("code", "javascript");
      const originalUpdatedAt = session.updatedAt;
      
      sessionStore.updateSessionLanguage(session.sessionId, "python");
      
      const updated = sessionStore.getSession(session.sessionId);
      expect(updated?.language).toBe("python");
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it("should throw error if session does not exist", () => {
      expect(() => {
        sessionStore.updateSessionLanguage("nonexistent", "python");
      }).toThrow("Session not found");
    });

    it("should throw error if language is invalid", () => {
      const session = sessionStore.createSession();
      expect(() => {
        sessionStore.updateSessionLanguage(session.sessionId, "");
      }).toThrow("Language must be a non-empty string");
      
      expect(() => {
        sessionStore.updateSessionLanguage(session.sessionId, null as any);
      }).toThrow("Language must be a non-empty string");
    });
  });
});
