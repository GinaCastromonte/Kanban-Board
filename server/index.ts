import 'dotenv/config';
import express, { type Express, type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { createServer, type Server } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

let serverInstance: Server | null = null;
let routesRegistered = false;

export async function createApp(): Promise<Express> {
  if (!routesRegistered) {
    serverInstance = await registerRoutes(app);
    routesRegistered = true;
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.VERCEL) {
    return app;
  }

  if (app.get("env") === "development") {
    if (serverInstance) {
      await setupVite(app, serverInstance);
    }
  } else {
    serveStatic(app);
  }

  return app;
}

export default app;

if (!process.env.VERCEL) {
  (async () => {
    await createApp();
    const port = parseInt(process.env.PORT || '3000', 10);
    if (serverInstance) {
      (serverInstance as Server).listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    }
  })();
}
