# USI Hub — Silent Demo Script

**Format:** screen recording or live click-through only. No voiceover.

**Target length:** 4–6 minutes.

**Demo URL:** `https://anystuf.github.io/usihubdemo/#overview`

**Data note:** use only the anonymized public demo records. Do not open or display confidential source files.

## Recording setup

1. Open the demo URL in a desktop browser.
2. Set browser zoom to 90–100% and close unrelated tabs.
3. Start on `Overview` with the sidebar visible.
4. Keep the cursor visible and pause for 1–2 seconds after each navigation.
5. Use on-screen captions only; do not record microphone audio.

## Walkthrough

| Time | Screen action | What should be visible | Optional on-screen caption |
|---|---|---|---|
| 0:00–0:20 | Load `#/overview`. Scroll from the header to the KPI cards. | Overview Dashboard, cohort filter, six KPI cards. | `One operating view for startup support` |
| 0:20–0:45 | Scroll through Executive Analytics. | Risk distribution, lifecycle-stage distribution, support needs, document readiness. | `See portfolio signals before the next meeting` |
| 0:45–1:05 | Scroll to Top Priorities and Recent Support Tasks. | Risk reviews, open tasks, document follow-ups, AI proposal count, task list. | `Turn signals into owned next actions` |
| 1:05–1:25 | Click `Startups` in the sidebar. Filter or sort by risk, then open `Venture Beta` (or another visible startup). | Startup OS list and startup record. | `Move from portfolio view to one startup` |
| 1:25–2:05 | On Startup Detail, scroll through the profile. | Startup summary, health/risk signal, road-map style Lifecycle Progress, Roadblocks & Needs, Business Metrics, ongoing supports. | `Track stage progress with evidence and data gaps` |
| 2:05–2:30 | In the AI Recommendation area, select a suggested prompt or open `USI Intelligence`. | Grounded recommendation with evidence, sources, confidence, missing data, and next actions. | `AI proposes a next step` |
| 2:30–2:45 | If an AI Proposed Update is shown, click `Review`, then `Approve` or `Reject`. | Proposal status changes and the approval/audit interaction. | `Humans approve; AI never writes silently` |
| 2:45–3:05 | Click `Incubation Tasks` / `Project Board`. Open one task. | Startup-support worklist, owner, due date, priority, and task detail. | `Coordinate follow-up work, not just status` |
| 3:05–3:25 | Click `Knowledge Base`. Apply a category or status filter and open a record. | Course/catalog-style knowledge cards, source metadata, linked startup, readiness/evidence fields. | `Make institutional knowledge reusable` |
| 3:25–3:55 | Click `USI Intelligence` or use the floating USI button. Submit: `Which startup is at risk?` | Answer panel with evidence and a clear local-demo provider label when applicable. | `Ask for a grounded portfolio brief` |
| 3:55–4:15 | Open the role selector and switch between `SGA`, `Leader`, `Mentor`, and `Founder`. | Role-context presentation changes. | `Same platform, role-relevant context` |
| 4:15–4:30 | Return to `Overview`. End on the dashboard. | Overview with the main coordination signals visible. | `AI proposes. Humans decide.` |

## Silent interaction rules

- Do not narrate, record a microphone, or add a voice track.
- Use short captions instead of spoken explanations.
- Do not claim that demo health scores are authoritative.
- Do not imply that role switching is production RBAC; it changes demo presentation only.
- Do not show Firebase seed controls, confidential records, raw interviews, API keys, or local-server screens.
- If an action is unavailable, continue to the next row rather than improvising a backend claim.

## AI status to show accurately

- On GitHub Pages, responses come from the deterministic local evidence engine over bundled demo data.
- Gemini is available only through the configured local server or Firebase callable path; it is not called directly from the public browser page.
- RAG retrieval is planned but not active in this demonstrator.

## End state

Finish on the Overview dashboard with the sidebar and KPI/analytics area in view. The final frame should communicate a governed incubation operating system, not a generic chatbot: shared startup context, actionable work, reusable knowledge, and human approval of AI proposals.
