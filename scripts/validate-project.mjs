import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const requiredFiles = [
  ".github/workflows/ci-cd.yml",
  "Dockerfile",
  "nginx.conf",
  "package.json",
  "vercel.json",
  "index.html",
  "health.html",
  ".gitleaks.toml",
];

const failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(resolve(root, file), "utf8"));
}

function readText(file) {
  return readFileSync(resolve(root, file), "utf8");
}

for (const file of requiredFiles) {
  assert(existsSync(resolve(root, file)), `Missing required file: ${file}`);
}

const packageJson = readJson("package.json");
const vercelConfig = readJson("vercel.json");
const workflow = readText(".github/workflows/ci-cd.yml");
const indexHtml = readText("index.html");
const healthHtml = readText("health.html");

assert(packageJson.name === "resume-matcher", "package.json name should remain resume-matcher.");
assert(typeof packageJson.scripts?.lint === "string", "package.json must define a lint script.");
assert(typeof packageJson.scripts?.test === "string", "package.json must define a test script.");
assert(typeof packageJson.scripts?.["ci:validate"] === "string", "package.json must define a ci:validate script.");

assert(vercelConfig.git?.deploymentEnabled === false, "vercel.json must disable automatic Git deployments.");
assert(Array.isArray(vercelConfig.routes), "vercel.json must define routes for static hosting.");
assert(vercelConfig.routes.some((route) => route.src === "/health"), "vercel.json must expose /health.");

assert(workflow.includes("deploy-vercel"), "Workflow must include a deploy-vercel job.");
assert(workflow.includes("docker-publish"), "Workflow must include a docker-publish job.");
assert(workflow.includes("SNYK_TOKEN"), "Workflow must reference the SNYK token.");
assert(workflow.includes("DOCKERHUB_USERNAME"), "Workflow must reference Docker Hub credentials.");
assert(workflow.includes("vercel deploy --prebuilt --prod"), "Workflow must use prebuilt Vercel deployments.");

assert(indexHtml.includes("<title>"), "index.html must contain a title tag.");
assert(indexHtml.toLowerCase().includes("resume"), "index.html should still describe the resume matcher app.");
assert(healthHtml.toLowerCase().includes("healthy"), "health.html should contain a healthy status indicator.");

if (failures.length > 0) {
  console.error("Project validation failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Project validation passed.");
