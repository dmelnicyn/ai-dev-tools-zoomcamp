import request from "supertest";
import { Express } from "express";
import { Server } from "http";
import { io as ioClient, Socket } from "socket.io-client";
import { createServer } from "../index";
import { sessionStore } from "../models/sessionStore";

describe("End-to-End Workflow Integration Tests", () => {
  let app: Express;
  let httpServer: Server;
  let clientSocket1: Socket;
  let clientSocket2: Socket;
  const port = 4002;

  beforeAll((done) => {
    sessionStore.clear();
    const server = createServer();
    app = server.app;
    httpServer = server.httpServer;
    httpServer.listen(port, () => {
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket1) {
      clientSocket1.close();
    }
    if (clientSocket2) {
      clientSocket2.close();
    }
    sessionStore.clear();
    httpServer.close(() => {
      done();
    });
  });

  afterEach(() => {
    if (clientSocket1) {
      clientSocket1.removeAllListeners();
      clientSocket1.close();
    }
    if (clientSocket2) {
      clientSocket2.removeAllListeners();
      clientSocket2.close();
    }
  });

  describe("Complete interview session workflow", () => {
    it("should handle full workflow: create session -> join -> collaborate -> change language", async () => {
      sessionStore.clear();

      // Step 1: Create session via REST API
      const createResponse = await request(app)
        .post("/api/sessions")
        .expect(201);

      const sessionId = createResponse.body.sessionId;
      expect(sessionId).toBeDefined();

      // Step 2: Verify session exists via REST API
      const getResponse = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(getResponse.body.sessionId).toBe(sessionId);
      expect(getResponse.body.language).toBe("javascript");

      // Step 3: First client joins session
      const client1Ready = new Promise<void>((resolve) => {
        clientSocket1 = ioClient(`http://localhost:${port}`, {
          transports: ["websocket"],
        });

        clientSocket1.on("connect", () => {
          clientSocket1.emit("join-session", { sessionId });

          clientSocket1.on("session-state", (data) => {
            expect(data.code).toBe("");
            expect(data.language).toBe("javascript");
            resolve();
          });
        });
      });

      await client1Ready;

      // Step 4: Second client joins session
      const client2Ready = new Promise<void>((resolve) => {
        clientSocket2 = ioClient(`http://localhost:${port}`, {
          transports: ["websocket"],
        });

        clientSocket2.on("connect", () => {
          clientSocket2.emit("join-session", { sessionId });

          clientSocket2.on("session-state", (data) => {
            expect(data.code).toBe("");
            expect(data.language).toBe("javascript");
            resolve();
          });
        });
      });

      await client2Ready;

      // Step 5: Client 1 writes code
      const client2ReceivesCode = new Promise<void>((resolve, reject) => {
        const handler = (data: { code: string }) => {
          if (data.code === "function hello() { return 'world'; }") {
            clientSocket2.off("code-update", handler);
            resolve();
          }
        };
        clientSocket2.on("code-update", handler);
        
        setTimeout(() => reject(new Error("Timeout waiting for code update")), 5000);
      });

      clientSocket1.emit("code-change", {
        sessionId,
        code: "function hello() { return 'world'; }",
      });

      await client2ReceivesCode;

      // Step 6: Verify code is stored on server
      const sessionAfterCode = sessionStore.getSession(sessionId);
      expect(sessionAfterCode?.code).toBe("function hello() { return 'world'; }");

      // Step 7: Client 2 changes language
      const client1ReceivesLanguage = new Promise<void>((resolve, reject) => {
        const handler = (data: { language: string }) => {
          if (data.language === "typescript") {
            clientSocket1.off("language-update", handler);
            resolve();
          }
        };
        clientSocket1.on("language-update", handler);
        
        setTimeout(() => reject(new Error("Timeout waiting for language update")), 5000);
      });

      clientSocket2.emit("language-change", {
        sessionId,
        language: "typescript",
      });

      await client1ReceivesLanguage;

      // Step 8: Verify language is stored on server
      const sessionAfterLanguage = sessionStore.getSession(sessionId);
      expect(sessionAfterLanguage?.language).toBe("typescript");

      // Step 9: Client 1 makes another code change
      const client2ReceivesCode2 = new Promise<void>((resolve, reject) => {
        const handler = (data: { code: string }) => {
          if (data.code === "const hello = () => 'world';") {
            clientSocket2.off("code-update", handler);
            resolve();
          }
        };
        clientSocket2.on("code-update", handler);
        
        setTimeout(() => reject(new Error("Timeout waiting for second code update")), 5000);
      });

      clientSocket1.emit("code-change", {
        sessionId,
        code: "const hello = () => 'world';",
      });

      await client2ReceivesCode2;

      // Step 10: Final verification
      const finalSession = sessionStore.getSession(sessionId);
      expect(finalSession?.code).toBe("const hello = () => 'world';");
      expect(finalSession?.language).toBe("typescript");
    }, 15000);

    it("should handle multiple rapid code changes", async () => {
      sessionStore.clear();

      const createResponse = await request(app)
        .post("/api/sessions")
        .expect(201);

      const sessionId = createResponse.body.sessionId;

      const client1Ready = new Promise<void>((resolve) => {
        clientSocket1 = ioClient(`http://localhost:${port}`, {
          transports: ["websocket"],
        });

        clientSocket1.on("connect", () => {
          clientSocket1.emit("join-session", { sessionId });
          clientSocket1.on("session-state", () => {
            resolve();
          });
        });
      });

      await client1Ready;

      const receivedUpdates: string[] = [];

      clientSocket1.on("code-update", (data) => {
        if (data.code !== "") {
          receivedUpdates.push(data.code);
        }
      });

      // Send rapid updates
      for (let i = 0; i < 5; i++) {
        clientSocket1.emit("code-change", {
          sessionId,
          code: `code version ${i}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Wait for all updates to propagate
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify last update is stored
      const session = sessionStore.getSession(sessionId);
      expect(session?.code).toBe("code version 4");
    }, 10000);
  });
});
