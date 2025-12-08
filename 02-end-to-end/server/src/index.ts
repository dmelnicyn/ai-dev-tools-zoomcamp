import express from "express";
import { createServer as createHttpServer } from "http";
import cors from "cors";
import path from "path";
import { config } from "./config";
import { sessionsRouter } from "./routes/sessions";
import { initializeSocket } from "./realtime/socket";

export function createServer() {
  const app = express();
  
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  
  app.use(express.json());
  
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  app.use("/api", sessionsRouter);
  
  // Serve static files from client build in production
  if (process.env.NODE_ENV === "production") {
    // __dirname will be /app/dist, so ../client/dist resolves to /app/client/dist
    const clientBuildPath = path.resolve(__dirname, "../client/dist");
    console.log("Serving static files from:", clientBuildPath);
    app.use(express.static(clientBuildPath));
    
    // Catch-all handler: send back React's index.html file for client-side routing
    app.get("*", (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  }
  
  const httpServer = createHttpServer(app);
  initializeSocket(httpServer);
  
  return { app, httpServer };
}

if (require.main === module) {
  const { httpServer } = createServer();
  httpServer.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
}
