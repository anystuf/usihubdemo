# Demo Script

## 1. Open Overview

Explain that this is a static prototype for USI Hub / UEH Innovation Platform V2. It shows how startup progress, documents, project execution, and AI-supported recommendations could live in one product experience.

## 2. Show Startup OS

Filter by risk or sector. Open Skyholic, NIION, Ecombox, or EmerGeniZ. Point out traction, risk reason, mentor need, KPIs, linked documents, last check-in, next actions, and missing data.

## 3. Show USI Brain

Ask one of these prompts:

- Which startup is at risk?
- What mentor does Skyholic need?
- How can Ecombox grow?
- Generate NIION brief

Highlight the response format: answer, evidence, sources, confidence, missing data, next actions, and AI Proposed Update.

Click Approve/Reject on the proposed update to show the product principle: AI suggests; SGA/Leader approves.

If the local proxy is running with `.env.local`, USI Brain uses Gemini 3.5 Flash locally. If Firebase Functions is deployed and `GEMINI_API_KEY` is configured, it can use the backend function. If neither is available, it falls back to local demo logic and displays the provider note in the answer card.

## 4. Show Knowledge Base

Explain that current PDFs, CSV/XLSX files, pitch decks, roadmaps, and slides become searchable evidence. Show indexed status, evidence use, extraction quality, and linked startup.

If running locally with Google credentials, click Seed Firestore to create demo collections.

## 5. Show Founder Q&A

Explain the Bookface-inspired loop: founders ask trusted questions, mentors/SGAs/alumni answer, and high-quality answers can be approved into the Knowledge Base.

## 6. Close With Guardrails

AI does not make final decisions. AI does not directly update startup data. USI Brain should only create proposed updates that a human approves.

## Optional: Show Project Board

Add a task, move it across columns, and increase progress. Explain that this is local demo state now and maps to Firestore `projectTasks` later.
