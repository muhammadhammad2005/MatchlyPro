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

function firstEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function inferProviderName(baseUrl, explicitProvider) {
  const declared = String(explicitProvider || "").trim();
  if (declared) return declared;

  const normalizedUrl = String(baseUrl || "").toLowerCase();
  if (normalizedUrl.includes("googleapis.com") || normalizedUrl.includes("/openai")) return "Gemini";
  if (normalizedUrl.includes("api.openai.com")) return "OpenAI";
  if (normalizedUrl.includes("openrouter.ai")) return "OpenRouter";
  if (normalizedUrl.includes("groq.com")) return "Groq";
  if (normalizedUrl.includes("together.xyz")) return "Together AI";
  return "AI";
}

function resolveBaseUrl() {
  const configuredBaseUrl = firstEnv("GEMINI_BASE_URL", "AI_BASE_URL", "OPENAI_BASE_URL");
  if (configuredBaseUrl) return configuredBaseUrl;

  if (firstEnv("GEMINI_API_KEY")) {
    return "https://generativelanguage.googleapis.com/v1beta/openai/";
  }

  if (firstEnv("OPENAI_API_KEY", "AI_API_KEY")) {
    return "https://api.openai.com/v1";
  }

  return "";
}

function resolveDefaultModel() {
  return firstEnv("GEMINI_MODEL", "AI_MODEL", "OPENAI_MODEL")
    || (firstEnv("GEMINI_API_KEY") ? "gemini-2.5-flash-lite" : "gpt-4.1-mini");
}

const resolvedBaseUrl = resolveBaseUrl();

const aiConfig = {
  provider: inferProviderName(resolvedBaseUrl, firstEnv("GEMINI_PROVIDER", "AI_PROVIDER", "OPENAI_PROVIDER")) || "Gemini",
  model: resolveDefaultModel(),
  apiKey: firstEnv("GEMINI_API_KEY", "AI_API_KEY", "OPENAI_API_KEY"),
  baseUrl: resolvedBaseUrl
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
  if (/\/responses$/i.test(trimmed)) return trimmed.replace(/\/responses$/i, "/chat/completions");
  if (/\/openai$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  if (/gemini/i.test(providerName) || providerName === "AI") return `${trimmed}/chat/completions`;
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

const jobTitleKeywordPattern = /(engineer|developer|analyst|manager|designer|specialist|consultant|administrator|architect|lead|intern|director|officer|coordinator|scientist|translator|writer|copywriter|marketer|recruiter|assistant|executive|strategist|producer|editor|accountant|bookkeeper|teacher|instructor|nurse|tester|qa|product owner|product manager|scrum master|support|sales|operations|seo|devops|sre|technician)/i;

function cleanJobTitleCandidate(value) {
  let candidate = normalizeLine(value || "");
  if (!candidate) return "";
  candidate = candidate
    .replace(/^(job title|title|role|position)\s*:\s*/i, "")
    .replace(/^(we are|we're|company is)\s+(actively\s+)?(hiring|seeking|looking for)\s+(an?\s+)?/i, "")
    .replace(/^(hiring|seeking|looking for)\s+(an?\s+)?/i, "")
    .replace(/^(open position|job opening)\s*:\s*/i, "")
    .replace(/\s+(to join|to support|who will|who can|responsible for|for our|for the|with experience in|with)\b.*$/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[|•]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/[,:;.-]+$/g, "")
    .trim();

  if (!candidate || candidate.length < 3 || candidate.length > 90) return "";
  if (/^(responsibilities|requirements|about (the role|us|company)|overview|location|salary|benefits)$/i.test(candidate)) return "";
  if (!jobTitleKeywordPattern.test(candidate)) return "";
  return candidate;
}

function extractJobTitle(jd) {
  const lines = String(jd || "").replace(/\r/g, "").split("\n").map(normalizeLine).filter(Boolean);
  const candidates = [];

  for (const [index, line] of lines.slice(0, 18).entries()) {
    if (line.length > 140) continue;
    if (/responsibilities|requirements|about the role|about us|company overview|what you('|’)ll do|what we're looking for|preferred qualifications/i.test(line)) continue;

    const explicit = /^(job title|title|role|position)\s*:\s*(.+)$/i.exec(line);
    const directCandidate = cleanJobTitleCandidate(explicit?.[2] || line);
    if (!directCandidate) continue;

    let score = 100 - index * 3;
    if (explicit?.[2]) score += 40;
    if (line.length <= 70) score += 12;
    if (!/[.!?]$/.test(line)) score += 6;
    if (/senior|junior|lead|principal|staff|head|associate|intern/i.test(directCandidate)) score += 8;
    if (/ at | with | for | who | and | responsible /i.test(directCandidate)) score -= 18;

    candidates.push({ title: directCandidate, score });
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.score - a.score || a.title.length - b.title.length);
    return candidates[0].title;
  }

  const sentenceMatch = String(jd || "").match(new RegExp(`(?:hiring|seeking|looking for|position(?:\\s+is)?|role(?:\\s+is)?)\\s+(?:an?\\s+)?([A-Za-z][A-Za-z/&,()\\- ]{2,80}?\\b${jobTitleKeywordPattern.source}\\b[A-Za-z/&,()\\- ]{0,30})`, "i"));
  return cleanJobTitleCandidate(sentenceMatch?.[1] || "");
}

function detectRoleFamily(text) {
  const s = String(text || "").toLowerCase();
  if (/translation|translator|arabic|english|localization|localisation/.test(s)) return "Translation / Localization";
  if (/content writer|copywriter|copy writing|content creation|blog/.test(s)) return "Content / Copywriting";
  if (/customer support|customer service|support specialist|help desk/.test(s)) return "Customer Support";
  if (/recruiter|recruitment|talent acquisition|human resources|hr /.test(s)) return "People / HR";
  if (/sales|business development|account executive|lead generation/.test(s)) return "Sales / Business Development";
  if (/operations|coordinator|administrator|administrative|virtual assistant/.test(s)) return "Operations / Administration";
  if (/designer|ux|ui|figma|product design/.test(s)) return "Design";
  if (/teacher|instructor|curriculum|education|tutor/.test(s)) return "Education";
  if (/marketing|seo|campaign|brand|growth/.test(s)) return "Marketing";
  if (/devops|infrastructure|platform|cloud/.test(s)) return "DevOps / Platform";
  if (/frontend|front-end|react|ui/.test(s)) return "Frontend Engineering";
  if (/backend|api|microservice|server/.test(s)) return "Backend Engineering";
  if (/full-stack|full stack/.test(s)) return "Full-Stack Engineering";
  if (/data analyst|analytics|bi|dashboard|sql/.test(s)) return "Data / Analytics";
  if (/product manager|roadmap|stakeholder/.test(s)) return "Product / Delivery";
  return "General Professional";
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

function sumWeights(items, multiplier = 1) {
  return ensureArray(items).reduce((total, item) => total + clamp(item?.weight || 0, 0, 100) * multiplier, 0);
}

function calibrateScore(rawScore, highMatch, partialMatch, missing) {
  const matchedWeight = sumWeights(highMatch) + sumWeights(partialMatch, 0.55);
  const missingWeight = sumWeights(missing);
  const evidenceTotal = matchedWeight + missingWeight;
  const evidenceScore = evidenceTotal ? (matchedWeight / evidenceTotal) * 100 : rawScore;

  let calibrated = rawScore * 0.58 + evidenceScore * 0.42;

  if (missing.some(item => item.weight >= 18)) calibrated = Math.min(calibrated, 84);
  if (missing.length >= 6) calibrated = Math.min(calibrated, 78);
  if (highMatch.length < 3) calibrated = Math.min(calibrated, 74);

  return clamp(Math.round(calibrated * 10) / 10, 0, 100);
}

function normalizeAnalysisShape(raw, jd, resume) {
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

  const score = calibrateScore(clamp(raw?.score, 0, 100), highMatch, partialMatch, missing);

  const confidence = ["High Match", "Medium Match", "Low Match"].includes(raw?.confidence)
    ? raw.confidence
    : score >= 78 ? "High Match" : score >= 52 ? "Medium Match" : "Low Match";

  const extractedRoleTitle = extractJobTitle(jd);
  const roleFamily = normalizeLine(raw?.roleFamily) || detectRoleFamily(jd);
  const roleTitle = extractedRoleTitle || normalizeLine(raw?.roleTitle) || roleFamily;

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

function extractTextFromContentParts(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content.map(part => {
    if (typeof part === "string") return part;
    if (typeof part?.text === "string") return part.text;
    if (typeof part?.output_text === "string") return part.output_text;
    return "";
  }).join("\n").trim();
}

function extractResponseText(parsedResponse) {
  const messageContent = parsedResponse?.choices?.[0]?.message?.content;
  const messageText = extractTextFromContentParts(messageContent);
  if (messageText) return messageText;

  if (typeof parsedResponse?.output_text === "string" && parsedResponse.output_text.trim()) {
    return parsedResponse.output_text.trim();
  }

  return ensureArray(parsedResponse?.output)
    .flatMap(item => ensureArray(item?.content))
    .map(part => part?.text || part?.output_text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
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

  const content = extractResponseText(parsedResponse);
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
    console.error("[resume-matcher]", error);
    json(res, 500, { error: error instanceof Error ? error.message : "Unexpected server error." });
  }
}

if (!process.env.VERCEL) {
  const server = createServer(handler);
  server.listen(port, () => {
    console.log(`MatchlyPro server listening on http://localhost:${port}`);
  });
}
