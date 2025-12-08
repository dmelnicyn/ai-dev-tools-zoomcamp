import { Server } from "http";
import { io as ioClient, Socket } from "socket.io-client";
import { createServer } from "../index";
import { sessionStore } from "../models/sessionStore";

describe("Socket.IO Integration Tests", () => {
  let httpServer: Server;
  let clientSocket1: Socket;
  let clientSocket2: Socket;
  const port = 4001;

  beforeAll((done) => {
    sessionStore.clear();
    const { httpServer: http } = createServer();
    httpServer = http;
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

  beforeEach((done) => {
    sessionStore.clear();
    done();
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

  describe("join-session event", () => {
    it("should allow client to join a session and receive initial state", (done) => {
      const session = sessionStore.createSession("initial code", "javascript");

      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", { sessionId: session.sessionId });

        clientSocket1.on("session-state", (data) => {
          expect(data.code).toBe("initial code");
          expect(data.language).toBe("javascript");
          done();
        });
      });
    });

    it("should emit error if session does not exist", (done) => {
      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", { sessionId: "nonexistent" });

        clientSocket1.on("error", (data) => {
          expect(data.message).toBe("Session not found");
          done();
        });
      });
    });

    it("should emit error if sessionId is missing", (done) => {
      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", {});

        clientSocket1.on("error", (data) => {
          expect(data.message).toBe("sessionId is required");
          done();
        });
      });
    });
  });

  describe("code-change event", () => {
    it("should broadcast code changes to all clients in the same session", (done) => {
      const session = sessionStore.createSession("initial", "javascript");

      let stateReceived1 = false;
      let codeUpdateReceived = false;

      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket2 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", { sessionId: session.sessionId });
      });

      clientSocket2.on("connect", () => {
        clientSocket2.emit("join-session", { sessionId: session.sessionId });
      });

      clientSocket1.on("session-state", () => {
        stateReceived1 = true;
        if (stateReceived1) {
          clientSocket1.emit("code-change", {
            sessionId: session.sessionId,
            code: "updated code",
          });
        }
      });

      clientSocket2.on("code-update", (data) => {
        expect(data.code).toBe("updated code");
        codeUpdateReceived = true;
        if (codeUpdateReceived) {
          const updatedSession = sessionStore.getSession(session.sessionId);
          expect(updatedSession?.code).toBe("updated code");
          done();
        }
      });
    });

    it("should not broadcast code changes to clients in different sessions", (done) => {
      const session1 = sessionStore.createSession("code1", "javascript");
      const session2 = sessionStore.createSession("code2", "javascript");

      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket2 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      let client1Ready = false;
      let client2Ready = false;

      const timeout = setTimeout(() => {
        done();
      }, 2000);

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", { sessionId: session1.sessionId });
      });

      clientSocket2.on("connect", () => {
        clientSocket2.emit("join-session", { sessionId: session2.sessionId });
      });

      clientSocket1.on("session-state", () => {
        client1Ready = true;
        if (client1Ready && client2Ready) {
          setTimeout(() => {
            clientSocket1.emit("code-change", {
              sessionId: session1.sessionId,
              code: "changed code1",
            });
          }, 100);
        }
      });

      clientSocket2.on("session-state", () => {
        client2Ready = true;
        if (client1Ready && client2Ready) {
          setTimeout(() => {
            clientSocket1.emit("code-change", {
              sessionId: session1.sessionId,
              code: "changed code1",
            });
          }, 100);
        }
      });

      clientSocket2.on("code-update", () => {
        clearTimeout(timeout);
        done(new Error("Client 2 should not receive updates from session1"));
      });
    });
  });

  describe("language-change event", () => {
    it("should broadcast language changes to all clients in the same session", (done) => {
      const session = sessionStore.createSession("code", "javascript");

      let stateReceived1 = false;
      let languageUpdateReceived = false;

      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket2 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", { sessionId: session.sessionId });
      });

      clientSocket2.on("connect", () => {
        clientSocket2.emit("join-session", { sessionId: session.sessionId });
      });

      clientSocket1.on("session-state", () => {
        stateReceived1 = true;
        if (stateReceived1) {
          clientSocket1.emit("language-change", {
            sessionId: session.sessionId,
            language: "python",
          });
        }
      });

      clientSocket2.on("language-update", (data) => {
        expect(data.language).toBe("python");
        languageUpdateReceived = true;
        if (languageUpdateReceived) {
          const updatedSession = sessionStore.getSession(session.sessionId);
          expect(updatedSession?.language).toBe("python");
          done();
        }
      });
    });
  });

  describe("end-to-end collaborative editing flow", () => {
    it("should sync code changes between multiple clients", (done) => {
      const session = sessionStore.createSession("start", "javascript");
      let client1ReceivedClient2Update = false;
      let client2ReceivedClient1Update = false;

      clientSocket1 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      clientSocket2 = ioClient(`http://localhost:${port}`, {
        transports: ["websocket"],
      });

      const checkDone = () => {
        if (client1ReceivedClient2Update && client2ReceivedClient1Update) {
          const finalSession = sessionStore.getSession(session.sessionId);
          expect(finalSession?.code).toBe("client2 change");
          done();
        }
      };

      clientSocket1.on("connect", () => {
        clientSocket1.emit("join-session", { sessionId: session.sessionId });
      });

      clientSocket2.on("connect", () => {
        clientSocket2.emit("join-session", { sessionId: session.sessionId });
      });

      // Both clients are ready when they receive session-state
      Promise.all([
        new Promise<void>((resolve) => {
          clientSocket1.on("session-state", () => resolve());
        }),
        new Promise<void>((resolve) => {
          clientSocket2.on("session-state", () => resolve());
        }),
      ]).then(() => {
        // Client1 sends update - Client2 should receive it
        clientSocket2.on("code-update", (data) => {
          if (data.code === "client1 change") {
            client2ReceivedClient1Update = true;
            checkDone();
          }
        });

        // Client1 emits first update
        clientSocket1.emit("code-change", {
          sessionId: session.sessionId,
          code: "client1 change",
        });

        // Client2 sends update after a delay - Client1 should receive it
        setTimeout(() => {
          clientSocket1.on("code-update", (data) => {
            if (data.code === "client2 change") {
              client1ReceivedClient2Update = true;
              checkDone();
            }
          });

          clientSocket2.emit("code-change", {
            sessionId: session.sessionId,
            code: "client2 change",
          });
        }, 300);
      });

      setTimeout(() => {
        if (!client1ReceivedClient2Update || !client2ReceivedClient1Update) {
          done(new Error(`Test timeout: client1 received client2 update: ${client1ReceivedClient2Update}, client2 received client1 update: ${client2ReceivedClient1Update}`));
        }
      }, 8000);
    }, 10000);
  });
});
