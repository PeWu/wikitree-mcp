import dotenv from "dotenv";
import { WikiTreeServer } from "./wikitree-server.js";

dotenv.config();

const server = new WikiTreeServer();

const useSSE = process.argv.includes("--sse");
const port = parseInt(process.argv.find(arg => arg.startsWith("--port="))?.split("=")[1] || "3000");

if (useSSE) {
  server.runSSE(port).catch((error) => {
    console.error("Failed to run SSE server:", error);
    process.exit(1);
  });
} else {
  server.runStdio().catch((error) => {
    console.error("Failed to run Stdio server:", error);
    process.exit(1);
  });
}
