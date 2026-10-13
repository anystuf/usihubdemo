# MVP Operations — browser-local pilot

Updated 13 October 2026. Open `#mvp-operations` from the sidebar. This extends the current static ES-module application and existing browser persistence. It does not deploy Firebase accounts, server authorization, RAG, or a screening model.

## Available workflows

| Feature | Implemented interaction | Remaining before full specification / production |
|---|---|---|
| F01 Startup profiles | Create/edit records with source, owner, cohort and lifecycle; changes appear in Startup List and Detail | Multi-cohort enrollment history, one-page export, server access control |
| F02 Evaluation | Draft application → submit → human reviews using fixed demo rubric → accept/reject with reason; acceptance creates startup record | Configurable versioned forms/rubrics, reviewer assignment and identity |
| F03 Worklist | Existing worklist now supports owner/due input, blocked/cancelled states and linked follow-ups | Shared persistence, reminders and full task audit |
| F04 Roadmap/session | Create milestone with completion criteria; record session linked to same-startup milestone; generate follow-up tasks; record outcome | Roadmap versioning and full coaching templates |
| F05 Cohort | Filter dashboard by cohort/startup; calculated task/session/milestone counts and links to task detail | Program roster, event schedule, attendance |
| F06 CRM | Create/edit people and organisation fields, expertise and latest interaction; records appear in Contacts | Separate organisations and chronological interaction records |
| F07 Metrics | Numeric metric per month with unit/definition, source and explicit data status; zero preserved; history in dashboard/detail | Approved metric catalog, stage templates, trend charts |
| F08 Management | Calculated portfolio/cohort view, task drill-down, metric history | Costs, KPIs/OKRs and immutable report snapshots |
| F09 Startup dashboard | Select one startup to see its tasks, milestones and metrics | Authenticated founder scope, membership and server enforcement |
| F10 Knowledge | Register source URL, category, owner and description; searchable in Knowledge Base; open source links | Files, versioning, permissions, full text retrieval |
| F11 SOP | Draft → publish immutable version → instantiate steps as startup tasks without duplicates | SOP approval matrix and explicit exceptions |
| F12 AI assistant | Reuses existing USI Intelligence page and proposal review | No new deployed AI/RAG capability in this update |
| F13 AI screening | Shows application source/status and human-review completeness; clearly labeled rule-based | Model screening is not active; needs approved rubric/model and evaluation |
| F14 Office hours | Create slots, prevent mentor overlap locally, book future slot, cancel booking | Shared concurrency, calendar integration and session linkage |
| F15 Shared services | Request → assign linked task → deliver URL → confirm completion | Service catalog, requester identity and permissions |

## Data and integration

- `mvpService.js`: schema checks, transitions, atomic workspace writes and activity history. Storage key `usiHubMvpV1`.
- `mvpSchema.js`: reusable form definitions with English/Vietnamese labels.
- `mvpWorkspace.js`: forms, search, filters, dashboards, review actions and JSON export.
- `dataService.js`: overlays local workspace on existing demo/Firestore reads. New records remain local even if Firestore reads work.
- Existing `usiHubProjectTasks` stores worklist edits; those edits take precedence over generated tasks. Worklist reset restores default tasks and original generated follow-ups; it does not delete workspace records.
- New resources and people flow to Knowledge Base and Contacts. New sessions update the displayed last check-in. Profile edits and accepted applications flow to Startup OS.
- Published SOPs, completed milestones, submitted/finalized applications, delivered/closed requests and booked slots cannot be edited through the generic form. Use workflow actions or create a new version.
- Role selection only demonstrates staff review controls. It is not proof of identity or production authorization.

## Try the flow

1. Applications: create synthetic applicant; submit.
2. Evaluation: choose submitted applicant; enter reviewer, three scores and notes.
3. Applications: accept with rationale; open new startup under Profiles.
4. Roadmap: add milestone; Growth sessions: add session referencing that milestone.
5. Create follow-up task; inspect/edit it in Incubation Worklist and Task Detail.
6. Metrics: enter `0` with Recorded status and a source; confirm it remains zero in dashboard/detail.
7. SOP: publish and instantiate; repeat to confirm existing checklist tasks are not duplicated.
8. Office hours: create future slot, book startup and cancel.
9. Shared services: assign task, add deliverable URL, confirm outcome.
10. Switch VI/EN; export workspace JSON; reload to retain records.

## Verification

Run `node --test scripts/mvp-workflows.test.js` for state-transition and integration tests. Tests use synthetic data and an in-memory storage adapter; they do not alter browser or Firebase records. Browser visual QA and production end-to-end deployment are separate checks.
