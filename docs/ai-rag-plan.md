# AI / RAG Plan

USI Intelligence should run through Firebase Cloud Functions or another secure backend. LLM API keys must not appear in frontend code.

The current scaffold exposes a callable function named `askUsiBrain` that calls Gemini `gemini-2.5-flash` from the backend. The key is expected as the Firebase Functions secret `GEMINI_API_KEY`.

## Retrieval Sources

- Startup roadmaps
- Pitch decks
- Cohort spreadsheets and CSV files
- Mentor notes
- Workshop materials
- Orientation slides
- Internal support notes approved for reuse
- Vietnam market, regulation, mentor, investor, and ecosystem references

## Response Format

Every answer should include:

- Answer
- Evidence
- Sources
- Confidence
- Missing data
- Suggested next actions

## Guardrails

- Do not make final startup decisions.
- Do not directly update startup or dashboard data.
- Create proposed updates only.
- Require human approval before approved data changes.
- Clearly separate evidence from inference.
- Flag low confidence when sources are missing, stale, or incomplete.

## Future Pipeline

1. Upload source to Firebase Storage.
2. Store metadata in Firestore.
3. Extract text in Cloud Functions.
4. Chunk content with source references.
5. Create embeddings and store in a vector index.
6. Retrieve relevant chunks for the user question.
7. Generate structured answer with citations using Gemini 3.5 Flash or another approved model.
8. Save as `aiProposal` if it suggests data changes.
9. Route proposal for human approval.
