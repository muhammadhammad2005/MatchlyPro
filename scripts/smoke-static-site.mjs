import http from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const indexHtml = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const healthHtml = readFileSync(resolve(process.cwd(), "health.html"), "utf8");

const server = http.createServer((req, res) => {
  if (!req.url || req.url === "/" || req.url.startsWith("/?")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(indexHtml);
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(healthHtml);
    return;
  }

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(indexHtml);
});

await new Promise((resolveServer) => server.listen(0, "127.0.0.1", resolveServer));

const address = server.address();
if (!address || typeof address === "string") {
  console.error("Could not determine smoke test server address.");
  process.exit(1);
}

const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const [home, health] = await Promise.all([
    fetch(`${baseUrl}/`),
    fetch(`${baseUrl}/health`),
  ]);

  if (!home.ok) {
    throw new Error(`Home route returned HTTP ${home.status}.`);
  }

  if (!health.ok) {
    throw new Error(`Health route returned HTTP ${health.status}.`);
  }

  const homeText = await home.text();
  const healthText = await health.text();

  if (!homeText.includes("MatchlyPro")) {
    throw new Error("Home route does not include the expected app branding.");
  }

  if (!healthText.toLowerCase().includes("healthy")) {
    throw new Error("Health route does not include the expected healthy status.");
  }

  console.log("Static smoke test passed.");
} finally {
  server.close();
}
