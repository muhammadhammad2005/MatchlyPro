import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const root = resolve(__dirname);

function loadEnvFile() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;
  const contents = readFileSync(envPath, "utf8");
  contents.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) return;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  });
}

loadEnvFile();

const port = Number(process.env.PORT || 3000);

const aiConfig = {
  provider: "AI",
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY || "",
  baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/"
};

const activeProvider = aiConfig;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function json(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function getChatCompletionsUrl(rawBaseUrl, providerName = "") {
  const trimmed = String(rawBaseUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/openai$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  if (providerName === "AI") return `${trimmed}/chat/completions`;
  if (/\/v1$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
}

function readBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024 * 2) {
        rejectBody(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => resolveBody(body));
    req.on("error", rejectBody);
  });
}

function normalizeLine(line) {
  return String(line || "").replace(/\s+/g, " ").trim();
}

function parseResumeSections(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const sections = [];
  let current = { name: "General", content: [] };
  const matchers = [
    { pattern: /professional summary|summary|profile/i, name: "Summary" },
    { pattern: /experience highlights|experience|employment|work history/i, name: "Experience" },
    { pattern: /projects|project highlights/i, name: "Projects" },
    { pattern: /skills|additional skills|technical skills|core skills/i, name: "Skills" },
    { pattern: /education|academic/i, name: "Education" },
    { pattern: /certifications|certificates/i, name: "Certifications" }
  ];

  for (const line of lines) {
    const trimmed = normalizeLine(line);
    const match = matchers.find(item => item.pattern.test(trimmed) && trimmed.length < 40);
    if (match) {
      if (current.content.join(" ").trim()) {
        sections.push({ name: current.name, content: current.content.join("\n").trim() });
      }
      current = { name: match.name, content: [] };
    } else {
      current.content.push(line);
    }
  }

  if (current.content.join(" ").trim()) {
    sections.push({ name: current.name, content: current.content.join("\n").trim() });
  }

  return sections.length ? sections : [{ name: "General", content: String(text || "") }];
}

function buildFallbackSections(resume, missingTerms = []) {
  const sections = parseResumeSections(resume);
  return sections.map((section, index) => ({
    name: section.name,
    score: Math.max(18, 74 - index * 9),
    suggestion: missingTerms[index]
      ? `Add "${missingTerms[index]}" with a concrete example.`
      : "This section looks aligned."
  }));
}

function buildPrompt(jd, resume) {
  return `
You are an elite Technical Recruiter and ATS Optimization Expert. Your goal is to provide a brutal, honest, and high-depth analysis of how a resume matches a specific Job Description (JD).

Return ONLY valid JSON.

### Analysis Instructions:
1.  **Deep Semantic Matching**: Don't just look for keywords. Understand the context, seniority level, and domain expertise required.
2.  **Evidence-Based Scoring**:
    - **High Match**: Clear, quantifiable evidence (e.g., "3 years of React", "Led a team of 5").
    - **Partial Match**: Mentioned but lacks depth or specific experience.
    - **Missing**: No evidence found for a critical requirement.
3.  **Role Sensitivity**: If the JD is for a non-tech role (Marketing, HR, etc.), do not use tech jargon. Match the domain language.
4.  **ATS Risk Assessment**: Identify formatting issues, missing standard sections, or over-complex language that might trip up older ATS systems.
5.  **Actionable Feedback**: Provide specific, high-value suggestions. Instead of "add skills", say "include metrics for your impact on user engagement using React".

### JSON Output Schema:
{
  "score": number (0-100),
  "confidence": "High Match" | "Medium Match" | "Low Match",
  "roleTitle": "Optimized role title based on JD",
  "roleFamily": "General industry category",
  "highMatch": [
    { "term": "Skill/Requirement", "weight": number (1-20), "evidence": "Briefly quote or summarize resume evidence" }
  ],
  "partialMatch": [
    { "term": "Skill/Requirement", "resumeTerm": "What resume has", "weight": number (1-15), "reason": "Why it is only a partial match" }
  ],
  "missing": [
    { "term": "Critical Missing Skill", "weight": number (1-25), "reason": "Impact on the application" }
  ],
  "topKeywords": [
    { "term": "Keyword", "weight": number (1-10) }
  ],
  "keywordCategories": [
    { "label": "e.g., Technical Skills", "top": ["Skill1", "Skill2"], "coverage": number (0-100) }
  ],
  "jdInsights": [
    { "title": "Priority", "detail": "What the JD prioritizes most", "note": "Strategic tip" }
  ],
  "atsRisks": [
    { "level": "low" | "medium" | "high", "title": "Risk Category", "note": "Specific observation" }
  ],
  "sectionAnalysis": [
    { "name": "Section Name", "score": number (0-100), "suggestion": "Specific improvement" }
  ],
  "experienceSignals": [
    { "title": "Longevity/Impact", "detail": "Analysis of their career progression", "note": "Recruiter's takeaway" }
  ],
  "suggestions": [
    { "term": "Action Step", "weight": number (1-10), "reason": "Why this will boost the score" }
  ],
  "summary": "5-8 lines of professional, hard-hitting analysis. Highlight the 'Why' behind the score."
}

### Constraint:
- Maximum 8 items per list (highMatch, partialMatch, missing, suggestions).
- Be strict. A 90%+ score should be very rare and reserved for perfect candidates.

### Input Data:
---
JOB DESCRIPTION:
${jd}

---
RESUME:
${resume}
---
`.trim();
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAnalysisShape(raw, jd, resume) {
  const score = clamp(raw?.score, 0, 100);
  const missing = ensureArray(raw?.missing).map(item => ({
    term: normalizeLine(item?.term),
    weight: clamp(item?.weight || 12, 1, 100),
    reason: normalizeLine(item?.reason)
  })).filter(item => item.term);

  const highMatch = ensureArray(raw?.highMatch).map(item => ({
    term: normalizeLine(item?.term),
    weight: clamp(item?.weight || 12, 1, 100),
    evidence: normalizeLine(item?.evidence)
  })).filter(item => item.term);

  const partialMatch = ensureArray(raw?.partialMatch).map(item => ({
    term: normalizeLine(item?.term),
    resumeTerm: normalizeLine(item?.resumeTerm || item?.evidence || item?.reason),
    weight: clamp(item?.weight || 10, 1, 100),
    reason: normalizeLine(item?.reason)
  })).filter(item => item.term);

  const topKeywords = ensureArray(raw?.topKeywords).map(item => ({
    term: normalizeLine(item?.term),
    weight: clamp(item?.weight || 10, 1, 100)
  })).filter(item => item.term).slice(0, 10);

  const keywordCategories = ensureArray(raw?.keywordCategories).map(item => ({
    label: normalizeLine(item?.label) || "General Fit",
    top: ensureArray(item?.top).map(normalizeLine).filter(Boolean).slice(0, 4),
    coverage: clamp(item?.coverage, 0, 100)
  })).slice(0, 6);

  const resumeSections = parseResumeSections(resume).map(section => section.name);
  const sectionAnalysis = (ensureArray(raw?.sectionAnalysis).length ? ensureArray(raw?.sectionAnalysis) : buildFallbackSections(resume, missing.map(item => item.term)))
    .map((item, index) => ({
      name: normalizeLine(item?.name) || resumeSections[index] || "General",
      score: clamp(item?.score || 40, 0, 100),
      suggestion: normalizeLine(item?.suggestion) || "Add more direct evidence for this section."
    })).slice(0, 6);

  const atsRisks = ensureArray(raw?.atsRisks).map(item => ({
    level: ["low", "medium", "high"].includes(item?.level) ? item.level : "medium",
    title: normalizeLine(item?.title) || "Needs review",
    note: normalizeLine(item?.note) || "The AI found a potential mismatch."
  })).slice(0, 5);

  const jdInsights = ensureArray(raw?.jdInsights).map(item => ({
    title: normalizeLine(item?.title) || "Insight",
    detail: normalizeLine(item?.detail),
    note: normalizeLine(item?.note)
  })).filter(item => item.title && item.detail).slice(0, 5);

  const experienceSignals = ensureArray(raw?.experienceSignals).map(item => ({
    title: normalizeLine(item?.title) || "Signal",
    detail: normalizeLine(item?.detail) || "Limited",
    note: normalizeLine(item?.note) || "Review resume evidence."
  })).slice(0, 5);

  const suggestions = ensureArray(raw?.suggestions).map(item => ({
    term: normalizeLine(item?.term),
    weight: clamp(item?.weight || 8, 1, 100),
    reason: normalizeLine(item?.reason) || "Add a concrete result tied to this requirement."
  })).filter(item => item.term).slice(0, 8);

  const confidence = ["High Match", "Medium Match", "Low Match"].includes(raw?.confidence)
    ? raw.confidence
    : score >= 78 ? "High Match" : score >= 52 ? "Medium Match" : "Low Match";

  const roleTitle = normalizeLine(raw?.roleTitle) || "Resume Match Analysis";
  const roleFamily = normalizeLine(raw?.roleFamily) || "General Professional";

  const summary = normalizeLine(raw?.summary)
    ? String(raw.summary)
    : [
      "Match Overview",
      `Role Family: ${roleFamily}`,
      `Match Score: ${score.toFixed(1)}%`,
      `Confidence: ${confidence}`,
      `Top Evidence Areas: ${topKeywords.slice(0, 5).map(item => item.term).join(", ") || "Limited evidence"}`,
      `Suggested Additions: ${missing.slice(0, 5).map(item => item.term).join(", ") || "No urgent gaps"}`
    ].join("\n");

  return {
    score,
    confidence,
    roleTitle,
    roleFamily,
    highMatch,
    partialMatch,
    missing,
    topKeywords,
    keywordCategories,
    jdInsights,
    atsRisks,
    sectionAnalysis,
    experienceSignals,
    suggestions,
    summary
  };
}

function extractJson(text) {
  if (typeof text !== "string") return text;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try { return JSON.parse(match[1]); } catch { /* ignore */ }
    }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch { /* ignore */ }
    }
    throw new Error("The AI response was not valid JSON.");
  }
}

async function requestAiAnalysis(jd, resume) {
  const endpoint = getChatCompletionsUrl(activeProvider.baseUrl, activeProvider.provider);
  if (!activeProvider.apiKey || !endpoint) {
    throw new Error("AI analyze is not configured. Set the required API key in your environment.");
  }

  const payload = {
    model: activeProvider.model,
    temperature: 0.1,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a strict resume-matching assistant. Always return valid json."
      },
      {
        role: "user",
        content: buildPrompt(jd, resume)
      }
    ]
  };

  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${activeProvider.apiKey}`
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  let parsedResponse = null;

  try {
    parsedResponse = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsedResponse = null;
  }

  if (!response.ok) {
    let detail = "";
    if (Array.isArray(parsedResponse) && parsedResponse[0]?.error) {
      detail = parsedResponse[0].error.message;
    } else {
      detail = parsedResponse?.error?.message || parsedResponse?.message || rawText || `HTTP ${response.status}`;
    }

    if (response.status === 429 || detail.includes("quota")) {
      detail = "You've reached the free daily limit for AI analysis. Please try again tomorrow!";
    } else if (detail.length > 150) {
      detail = `API Error (HTTP ${response.status}). Check server console for full details.`;
    }

    throw new Error(`AI analyze failed: ${detail}`);
  }

  const content = parsedResponse?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("The AI response was empty.");
  }

  let analysisRaw = null;
  try {
    analysisRaw = extractJson(content);
  } catch (err) {
    throw err;
  }

  return normalizeAnalysisShape(analysisRaw, jd, resume);
}

async function serveStatic(req, res, pathname) {
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(root, relativePath));
  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    const indexHtml = await readFile(join(root, "index.html"), "utf8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(indexHtml);
    return;
  }

  const fileInfo = await stat(filePath);
  if (fileInfo.isDirectory()) {
    const indexHtml = await readFile(join(root, "index.html"), "utf8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(indexHtml);
    return;
  }

  res.writeHead(200, { "content-type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}

export default async function handler(req, res) {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const { pathname } = requestUrl;

    if (req.method === "GET" && pathname === "/api/config") {
      json(res, 200, {
        enabled: Boolean(activeProvider.apiKey && activeProvider.baseUrl),
        provider: activeProvider.provider,
        model: activeProvider.model
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/analyze") {
      const body = await readBody(req);
      const payload = body ? JSON.parse(body) : {};
      const jd = String(payload?.jd || "").trim();
      const resume = String(payload?.resume || "").trim();

      if (!jd || !resume) {
        json(res, 400, { error: "Both job description and resume are required." });
        return;
      }

      const analysis = await requestAiAnalysis(jd, resume);
      json(res, 200, analysis);
      return;
    }

    if (req.method === "GET") {
      await serveStatic(req, res, pathname);
      return;
    }

    json(res, 404, { error: "Not found." });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Unexpected server error." });
  }
}

if (!process.env.VERCEL) {
  const server = createServer(handler);
  server.listen(port, () => {
    console.log(`MatchlyPro server listening on http://localhost:${port}`);
  });
}
