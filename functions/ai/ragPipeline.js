// TODO: Implement RAG pipeline in backend code only.
// Keep LLM API keys in secret manager or environment variables, never in frontend JS.

async function buildRagAnswerPlaceholder() {
  return {
    answer: "RAG pipeline is not implemented yet.",
    evidence: [],
    sources: [],
    confidence: "Not available",
    missingData: ["Backend implementation", "Document index", "LLM provider configuration"],
    suggestedNextActions: ["Configure Firebase Functions", "Add document extraction", "Add vector retrieval"]
  };
}

module.exports = { buildRagAnswerPlaceholder };
