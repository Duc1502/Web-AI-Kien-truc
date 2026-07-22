// Bootstrap chạy LOCAL: lấy Express app từ server.ts, gắn Vite (dev) hoặc phục vụ dist (prod
// self-host), rồi listen. Vercel KHÔNG dùng file này — trên Vercel các file api/*.ts import trực
// tiếp các handler, còn phần tĩnh do Vercel phục vụ. Tách Vite ra đây để server.ts (và các
// serverless function import nó) không bị bundle kèm Vite.
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./server";

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode (self-host)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CảiTạoNhà.AI running on port http://localhost:${PORT}`);
  });
}

startServer();
