import * as express from "express";
import type { Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamically import Vite and viteConfig
  let viteModule: any;
  try {
    // Use explicit path to avoid importing this file instead of the vite package
    viteModule = await import("vite");
  } catch (err) {
    throw new Error("Vite module not found. Is Vite installed and up to date?");
  }
  
  // Extract createServer from the module
  const createViteServer = viteModule.createServer || viteModule.default?.createServer;
  if (!createViteServer) {
    console.error('Available Vite exports:', Object.keys(viteModule));
    throw new Error("Vite createServer not found as a named export. Available exports: " + Object.keys(viteModule).join(', '));
  }
  const viteLogger = viteModule.createLogger ? viteModule.createLogger() : {};

  let viteConfigModule: any;
  try {
    viteConfigModule = await import(path.resolve(__dirname, "../vite.config.ts"));
  } catch (err) {
    throw new Error("Vite config not found or failed to load. Check vite.config.ts.");
  }
  const viteConfig = typeof viteConfigModule.default === "function"
    ? await viteConfigModule.default()
    : viteConfigModule.default;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  let vite: any;
  try {
    vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg: any, options: any) => {
          if (viteLogger && viteLogger.error) viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom",
    });
  } catch (err) {
    throw new Error("Vite server creation failed: " + (err instanceof Error ? err.message : String(err)));
  }

  app.use(vite.middlewares);
  app.use("*", async (req: any, res: any, next: any) => {
    const url = req.originalUrl;
    
    // Skip API routes - let them be handled by the API middleware
    if (url.startsWith('/api/')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      if (vite && vite.ssrFixStacktrace) vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files, but skip API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    express.static(distPath)(req, res, next);
  });

  // Fall through to index.html for non-API routes if the file doesn't exist
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
