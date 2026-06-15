# Firestore Data Model

This is the organized V2 demo schema for USI Hub / UEH Innovation Platform. It keeps the current frontend simple while leaving room for Auth, RAG, approval workflows, and Vietnam-context evaluation.

## Naming Rules

- Collection names use `camelCase`.
- Document IDs use stable slugs where possible.
- Every seeded document includes:
  - `schemaVersion`
  - `programId`
  - `visibility`
  - `demoSeed`
  - `createdAt`
  - `updatedAt`

## Core Collections

### `platformConfig`

System/config docs.

Recommended docs:

- `app`
- `demoSeed`
- `taxonomy`

Fields:

- `name`
- `version`
- `environment`
- `defaultProgramId`
- `publicReadCollections`
- `seededAt`

### `programs`

Incubation programs.

Fields:

- `name`
- `code`
- `year`
- `status`
- `ownerTeam`
- `description`

### `cohorts`

Program cohorts.

Fields:

- `programId`
- `name`
- `year`
- `status`
- `startDate`
- `endDate`
- `startupCount`

### `startups`

Startup operating profiles.

Fields:

- `name`
- `slug`
- `programId`
- `cohortId`
- `cohort`
- `stage`
- `sector`
- `riskLevel`
- `risk`
- `healthScore`
- `health`
- `summary`
- `traction`
- `founderNeed`
- `nextAction`
- `tags`
- `sourceDocumentIds`
- `sources`
- `missingData`
- `visibility`

Compatibility fields `risk` and `health` remain for the current UI. Prefer `riskLevel` and `healthScore` for new features.

### `documents`

Document metadata for Knowledge Base and future RAG indexing.

Fields:

- `title`
- `type`
- `programId`
- `cohortId`
- `startupId`
- `startup`
- `source`
- `storagePath`
- `tags`
- `indexedStatus`
- `indexed`
- `extractionStatus`
- `permissionLevel`
- `visibility`

Compatibility field `indexed` remains for the current UI. Prefer `indexedStatus` for new features.

### `projectTasks`

Internal project board tasks.

Fields:

- `title`
- `programId`
- `assignee`
- `due`
- `status`
- `progress`
- `priority`
- `workstream`
- `summary`

### `founderQuestions`

Founder Q&A prototype.

Fields:

- `programId`
- `startupId`
- `startup`
- `authorRole`
- `question`
- `answer`
- `answers`
- `tags`
- `status`
- `visibility`
- `approvedKnowledgeBaseEntryId`

### `mentorSessions`

Mentor/trainer support sessions.

Fields:

- `programId`
- `cohortId`
- `startupId`
- `mentorName`
- `mentorRole`
- `sessionType`
- `date`
- `status`
- `brief`
- `notes`
- `actionItems`
- `sourceDocumentIds`
- `visibility`

### `workshops`

Training/workshop events.

Fields:

- `programId`
- `cohortId`
- `title`
- `topic`
- `trainerName`
- `date`
- `status`
- `linkedDocumentIds`
- `feedbackSummary`
- `visibility`

### `aiInsights`

Approved/high-level AI-style insights for dashboard demo.

Fields:

- `title`
- `programId`
- `body`
- `action`
- `severity`
- `sourceDocumentIds`
- `visibility`

### `aiProposals`

AI-generated suggestions that require human approval before becoming official data.

Fields:

- `type`
- `programId`
- `startupId`
- `prompt`
- `answer`
- `evidence`
- `sources`
- `confidence`
- `missingData`
- `nextActions`
- `approvalStatus`
- `createdBy`
- `approvedBy`
- `approvedAt`
- `reviewNote`

### `sourceFiles`

Reference inventory from the original project folder.

Fields:

- `file`
- `use`
- `category`
- `linkedStartupId`
- `visibility`

### `users`

Future Auth profile records.

Fields:

- `displayName`
- `email`
- `role`
- `linkedStartupIds`
- `programIds`
- `createdAt`
- `lastActiveAt`

## Role Model

Expected Firebase Auth custom claims:

```json
{
  "role": "admin | leader | sga | program | mentor | trainer | founder | alumni",
  "programIds": ["usi-ip-2025"],
  "startupIds": ["venture-alpha", "venture-epsilon"],
  "admin": true
}
```

## Security Posture

Current demo rules allow public read for demo-safe collections. Writes are restricted to staff/admin roles, except founder questions and AI proposals where signed-in users can create limited documents.

Before production, move public reads behind Auth, enable App Check, restrict API keys, and add audit logging for all sensitive writes.
