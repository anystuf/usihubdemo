import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadLocalEnv();

const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.5-pro"];
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:4173,http://localhost:4174,http://localhost:4175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  try {
    applyCors(req, res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true, service: "usi-hub-ai", geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
      return;
    }

    if (req.method === "POST" && req.url === "/api/usi-brain") {
      await handleUsiBrain(req, res);
      return;
    }

    if (req.method === "POST" && req.url === "/api/seed-firestore") {
      await handleSeedFirestore(res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error" });
  }
});

function applyCors(req, res) {
  const requestOrigin = req.headers.origin;
  const requestHost = req.headers.host ? `https://${req.headers.host}` : "";
  const isSameOrigin = requestOrigin && requestOrigin === requestHost;
  if (requestOrigin && (CORS_ORIGINS.includes(requestOrigin) || isSameOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

server.listen(PORT, () => {
  console.log(`USI Hub local server running at http://localhost:${PORT}`);
  console.log("USI Intelligence local proxy:", process.env.GEMINI_API_KEY ? "enabled" : "missing GEMINI_API_KEY");
});

async function handleUsiBrain(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendJson(res, 503, { error: "Missing GEMINI_API_KEY in .env.local" });
      return;
    }

    const { prompt, context, conversation } = await readJsonBody(req);
    if (!prompt || typeof prompt !== "string") {
      sendJson(res, 400, { error: "Prompt is required" });
      return;
    }

    const { text: responseText, model } = await callGemini(prompt, context || {}, conversation, apiKey);
    const parsedResponse = parseStructuredResponse(responseText);
    sendJson(res, 200, { ...parsedResponse, modelUsed: model });
  } catch (error) {
    console.error("Error in handleUsiBrain:", error.message);
    console.error("Full error:", error);
    sendJson(res, 500, { error: error.message || "Failed to call Gemini API" });
  }
}

async function handleSeedFirestore(res) {
  const scriptPath = path.resolve(__dirname, "../functions/scripts/seedFirestore.js");
  execFile(process.execPath, [scriptPath], {
    cwd: path.resolve(__dirname, ".."),
    env: {
      ...process.env,
      GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || "usi-hub-platform",
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || "usi-hub-platform"
    },
    timeout: 60000
  }, (error, stdout, stderr) => {
    if (error) {
      sendJson(res, 500, {
        ok: false,
        message: "Firestore seed failed. Check Google Application Default Credentials or service account.",
        stdout,
        stderr: stderr || error.message
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      message: "Firestore demo collections seeded.",
      stdout
    });
  });
}

async function callGemini(prompt, context, conversation, apiKey) {
  const systemInstruction = [
    "You are USI Intelligence, a prototype RAG assistant for USI Hub / UEH Innovation Platform.",
    "Answer for startup incubation management and founder support.",
    "Use the provided context as evidence. If data is missing, say so.",
    "Never make final decisions about startups.",
    "Never claim that you updated dashboard or startup data.",
    "Return only valid JSON with keys: answer, evidence, sources, confidence, missingData, nextActions, proposedUpdate.",
    "Evidence, sources, missingData, and nextActions must be arrays of short strings.",
    "proposedUpdate must be an object with type, startupName, proposedChange, rationale, approvalStatus.",
    "Include Vietnam-context factors when relevant: local market, regulation, customer behavior, mentors, investors, grants, and ecosystem."
  ].join(" ");

  const brainResponseSchema = {
    type: "object",
    properties: {
      answer: { type: "string" },
      evidence: { type: "array", items: { type: "string" } },
      sources: { type: "array", items: { type: "string" } },
      confidence: { type: "string" },
      missingData: { type: "array", items: { type: "string" } },
      nextActions: { type: "array", items: { type: "string" } },
      proposedUpdate: {
        type: "object",
        properties: {
          type: { type: "string" },
          startupName: { type: "string" },
          proposedChange: { type: "string" },
          rationale: { type: "string" },
          approvalStatus: { type: "string" }
        }
      }
    },
    required: ["answer", "evidence", "sources", "confidence", "missingData", "nextActions", "proposedUpdate"]
  };

  // Try each model in sequence
  for (const model of GEMINI_MODELS) {
    try {
      const body = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          ...normalizeConversation(conversation),
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  userQuestion: prompt,
                  availableContext: context
                })
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1400,
          responseMimeType: "application/json",
          responseSchema: brainResponseSchema
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        console.log(`Model ${model} failed (${response.status}), trying next...`);
        continue;
      }

      const json = await response.json();
      const result = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (result) {
        console.log(`Successfully used model: ${model}`);
        return { text: result, model };
      }
    } catch (error) {
      console.log(`Model ${model} error: ${error.message}, trying next...`);
      continue;
    }
  }

  // If all models fail, throw error
  throw new Error(`All Gemini models failed (tried: ${GEMINI_MODELS.join(", ")})`);
}

function normalizeConversation(conversation) {
  if (!Array.isArray(conversation)) return [];

  return conversation
    .filter((message) => (
      message &&
      (message.role === "user" || message.role === "model") &&
      typeof message.text === "string" &&
      message.text.trim()
    ))
    .slice(-10)
    .map((message) => ({
      role: message.role,
      parts: [{ text: message.text.trim().slice(0, 4000) }]
    }));
}

function parseStructuredResponse(text) {
  try {
    const parsed = JSON.parse(extractJson(text));
    return {
      answer: asString(parsed.answer),
      evidence: asArray(parsed.evidence),
      sources: asArray(parsed.sources),
      confidence: asString(parsed.confidence || "Medium"),
      missingData: asArray(parsed.missingData),
      nextActions: asArray(parsed.nextActions),
      proposedUpdate: normalizeProposedUpdate(parsed.proposedUpdate),
      parseError: false
    };
  } catch (error) {
    const plainText = String(text || "").trim();
    return {
      answer: plainText || "The assistant returned an empty response. Please try the question again.",
      evidence: ["Gemini returned a text response, but not the requested structured JSON format."],
      sources: ["Gemini response"],
      confidence: "Medium",
      missingData: ["A structured AI response"],
      nextActions: ["Review the answer as advisory text; no platform update was created."],
      proposedUpdate: null,
      parseError: true
    };
  }
}

function extractJson(text) {
  const value = String(text || "").trim();
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1].trim() : value;
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallbackData) => {
        if (fallbackError) {
          sendText(res, 404, "Not found");
          return;
        }
        sendBuffer(res, 200, fallbackData, mimeTypes[".html"]);
      });
      return;
    }

    sendBuffer(res, 200, data, mimeTypes[path.extname(filePath)] || "application/octet-stream");
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, value) {
  sendBuffer(res, status, Buffer.from(JSON.stringify(value)), "application/json; charset=utf-8");
}

function sendText(res, status, value) {
  sendBuffer(res, status, Buffer.from(value), "text/plain; charset=utf-8");
}

function sendBuffer(res, status, data, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(data);
}

function asString(value) {
  return typeof value === "string" && value.trim() ? value : "Not provided.";
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value];
  return ["Not provided."];
}

function normalizeProposedUpdate(value) {
  if (!value || typeof value !== "object") {
    return {
      type: "AI proposal",
      startupName: "Program",
      proposedChange: "Review this answer before updating official records.",
      rationale: "No structured proposal was returned.",
      approvalStatus: "pending"
    };
  }

  return {
    type: asString(value.type || "AI proposal"),
    startupName: asString(value.startupName || "Program"),
    proposedChange: asString(value.proposedChange),
    rationale: asString(value.rationale || "Needs human approval."),
    approvalStatus: asString(value.approvalStatus || "pending")
  };
}

function loadLocalEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}
