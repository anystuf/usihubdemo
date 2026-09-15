const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash";

exports.askUsiBrain = onCall({ secrets: [geminiApiKey], cors: true }, async (request) => {
  const prompt = String(request.data?.prompt || "").trim();
  const context = request.data?.context || {};
  const conversation = normalizeConversation(request.data?.conversation);

  if (!prompt) {
    throw new HttpsError("invalid-argument", "Prompt is required.");
  }

  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY secret is not configured.");
  }

  const geminiResponse = await callGemini(prompt, context, conversation, apiKey);
  return parseStructuredResponse(geminiResponse);
});

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

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      ...conversation,
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
    return {
      answer: "The assistant could not format this response for review. Please try the question again.",
      evidence: ["The model response did not match the required structured format."],
      sources: [],
      confidence: "Low",
      missingData: ["A structured AI response"],
      nextActions: ["Try the question again with a more specific startup or task."],
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
