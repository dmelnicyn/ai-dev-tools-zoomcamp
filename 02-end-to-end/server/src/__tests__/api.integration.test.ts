import request from "supertest";
import { Express } from "express";
import { Server } from "http";
import { createServer } from "../index";
import { sessionStore } from "../models/sessionStore";

describe("API Integration Tests", () => {
  let app: Express;
  let httpServer: Server;

  beforeAll((done) => {
    sessionStore.clear();
    const server = createServer();
    app = server.app;
    httpServer = server.httpServer;
    httpServer.listen(() => {
      done();
    });
  });

  afterAll((done) => {
    sessionStore.clear();
    httpServer.close(() => {
      done();
    });
  });

  beforeEach(() => {
    sessionStore.clear();
  });

  describe("POST /api/sessions", () => {
    it("should create a new session", async () => {
      const response = await request(app)
        .post("/api/sessions")
        .expect(201);

      expect(response.body).toHaveProperty("sessionId");
      expect(typeof response.body.sessionId).toBe("string");
      expect(response.body.sessionId.length).toBeGreaterThan(0);
    });

    it("should create multiple unique sessions", async () => {
      const response1 = await request(app)
        .post("/api/sessions")
        .expect(201);

      const response2 = await request(app)
        .post("/api/sessions")
        .expect(201);

      expect(response1.body.sessionId).not.toBe(response2.body.sessionId);
    });

    it("should create a session that can be retrieved", async () => {
      const createResponse = await request(app)
        .post("/api/sessions")
        .expect(201);

      const sessionId = createResponse.body.sessionId;

      const getResponse = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(getResponse.body.sessionId).toBe(sessionId);
      expect(getResponse.body).toHaveProperty("language");
      expect(getResponse.body).toHaveProperty("updatedAt");
    });
  });

  describe("GET /api/sessions/:sessionId", () => {
    it("should return session metadata for existing session", async () => {
      const createResponse = await request(app)
        .post("/api/sessions")
        .expect(201);

      const sessionId = createResponse.body.sessionId;

      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(response.body.sessionId).toBe(sessionId);
      expect(response.body.language).toBe("javascript");
      expect(response.body).toHaveProperty("updatedAt");
    });

    it("should return 404 for non-existent session", async () => {
      const response = await request(app)
        .get("/api/sessions/nonexistent-session-id")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Session not found");
    });

    it("should return 400 for invalid session ID format", async () => {
      const response = await request(app)
        .get("/api/sessions/")
        .expect(404);
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app)
        .get("/health")
        .expect(200);

      expect(response.body).toEqual({ status: "ok" });
    });
  });
});
