const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-3.5-flash";

exports.askUsiBrain = onCall({ secrets: [geminiApiKey], cors: true }, async (request) => {
  const prompt = String(request.data?.prompt || "").trim();
  const context = request.data?.context || {};

  if (!prompt) {
    throw new HttpsError("invalid-argument", "Prompt is required.");
  }

  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY secret is not configured.");
  }

  const geminiResponse = await callGemini(prompt, context, apiKey);
  return parseStructuredResponse(geminiResponse);
});

async function callGemini(prompt, context, apiKey) {
  const systemInstruction = [
    "You are USI Brain, a prototype RAG assistant for USI Hub / UEH Innovation Platform.",
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

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
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
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: brainResponseSchema
        }
      }
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError("internal", `Gemini API request failed: ${response.status} ${errorText.slice(0, 300)}`);
  }

  const json = await response.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseStructuredResponse(text) {
  try {
    const parsed = JSON.parse(text);
    return {
      answer: asString(parsed.answer),
      evidence: asArray(parsed.evidence),
      sources: asArray(parsed.sources),
      confidence: asString(parsed.confidence || "Medium"),
      missingData: asArray(parsed.missingData),
      nextActions: asArray(parsed.nextActions),
      proposedUpdate: normalizeProposedUpdate(parsed.proposedUpdate)
    };
  } catch (error) {
    return {
      answer: text || "Gemini returned an empty response.",
      evidence: ["Raw Gemini response could not be parsed as structured JSON."],
      sources: ["Gemini API response"],
      confidence: "Low",
      missingData: ["Structured JSON response"],
      nextActions: ["Review the model response and retry with a more specific question."],
      proposedUpdate: {
        type: "AI response review",
        startupName: "Program",
        proposedChange: "Review unstructured Gemini output before using it.",
        rationale: "Model response could not be parsed into the required schema.",
        approvalStatus: "pending"
      }
    };
  }
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

// TODO: Add future functions:
// - onDocumentUploaded: extract text, chunk, and index source documents.
// - createAiProposal: store proposed updates that require human approval.
