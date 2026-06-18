# USI Hub / UEH Innovation Platform V2

Clean static prototype for a startup incubation management platform. This folder is intentionally separate from the existing reference files and does not overwrite or delete original materials.

## What This Prototype Includes

- Static HTML/CSS/vanilla JavaScript prototype in `public/`
- Modular CSS and JavaScript structure
- Enriched demo data for startup traction, risk reasons, mentor needs, contacts, evidence sources, missing data, support plans, documents, incubation tasks, and USI Intelligence responses
- Evidence-based USI Intelligence fallback with AI Proposed Update cards and human approval demo controls
- Interactive startup list/detail pages, Contacts, Knowledge Base, dashboard charts, and Incubation Worklist
- Firebase-ready folder structure for later Auth, Firestore, Storage, Hosting, and Cloud Functions
- Firebase web app config wired in the frontend
- `askUsiBrain` Firebase callable function scaffold for Gemini 3.5 Flash through backend only
- Product docs in `docs/`

## Run Locally

From this folder:

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

This local server serves the static app and exposes `/api/usi-brain` as a local Gemini proxy for USI Intelligence.

Create `.env.local` first:

```bash
copy .env.local.example .env.local
```

Then put your Gemini key in `.env.local`:

```text
GEMINI_API_KEY=your_key_here
PORT=4173
```

Do not commit `.env.local`. It is ignored by `.gitignore`.

In local server mode, Knowledge Base also includes a **Seed Firestore** button. It calls `/api/seed-firestore`, which runs the seed script and creates demo collections if local Google credentials are available.

## GitHub Pages Hosting

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.
It deploys the static prototype from `public/` to GitHub Pages whenever `main` is pushed.

After pushing to GitHub:

1. Open the repository on GitHub.
2. Go to `Settings -> Pages`.
3. Set `Build and deployment` to `GitHub Actions`.
4. Wait for the `Deploy static prototype to GitHub Pages` workflow to finish.

Expected public URL:

```text
https://anystuf.github.io/usihubdemo/
```

## Firebase And Gemini Setup

The frontend is configured for Firebase project `YOUR_FIREBASE_PROJECT_ID` in `public/js/services/firebaseService.js`.

This repo is pinned to Firebase project `YOUR_FIREBASE_PROJECT_ID` in `.firebaserc`. Before deploy/seed, make sure Firebase CLI is authenticated as:

```text
YOUR_FIREBASE_ACCOUNT_EMAIL
```

Check locally:

```bash
firebase login:list
firebase use
```

If needed:

```bash
firebase login --reauth
firebase use YOUR_FIREBASE_PROJECT_ID
```

Run the project/account preflight check:

```bash
cd functions
npm run preflight:firebase-account
cd ..
```

Deploy Firestore rules and indexes first:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Firebase Storage is optional for this prototype until the upload flow is built. Storage is intentionally not included in `firebase.json` right now, so deploys will not touch it.

If you want to enable Storage later, first open Firebase Console > Storage > Get Started for project `YOUR_FIREBASE_PROJECT_ID`, then add this back to `firebase.json`:

```json
"storage": {
  "rules": "storage.rules"
}
```

Then run:

```bash
firebase deploy --only storage
```

Seed the demo database collections:

```bash
cd functions
npm install
npm run preflight:firebase-account
npm run seed:firestore
cd ..
```

You can also run the same seed from the UI:

1. Run `npm run dev`.
2. Open `http://localhost:4173`.
3. Go to Knowledge Base.
4. Click **Seed Firestore**.

The seed script uses Firebase Admin SDK. If it cannot authenticate locally, set Application Default Credentials or a service account first:

```bash
gcloud auth application-default login
```

or:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
```

After seeding, Firestore should contain:

- `startups`
- `documents`
- `projectTasks`
- `contacts`
- `supportNotes`
- `aiInsights`
- `sourceFiles`
- `platformConfig/demoSeed`
- `programs`
- `cohorts`
- `mentorSessions`
- `workshops`
- `aiProposals`

The Gemini API key must not be stored in frontend code. Configure it as a Firebase Functions secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Then deploy functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Deploy hosting after the static prototype is ready:

```bash
firebase deploy --only hosting
```

The frontend reads Firestore first. If Firestore is empty, rules are not deployed, or the browser cannot read the database, it falls back to local demo data so the prototype remains usable.

USI Intelligence calls the callable function `askUsiBrain`. If the function is not deployed or the secret is not configured, the UI falls back to local demo responses.

### If Firebase Project Is Still On Spark Plan

Firebase Functions secrets require Blaze, so Spark cannot deploy the Gemini backend function. For demo without Blaze:

1. Keep Firebase Hosting/Firestore as-is.
2. Run locally with `npm run dev`.
3. Store the Gemini key in `.env.local`.
4. USI Intelligence will call `/api/usi-brain` locally.

Do not deploy `.env.local` or hard-code the Gemini key into frontend JavaScript.

## Folder Structure

```text
usi-hub-platform-v2/
  public/
    index.html
    css/
    js/
      components/
      modules/
      services/
      utils/
    assets/
      demo-data/
  functions/
    ai/
    services/
    utils/
  docs/
```

## Public Demo Data Policy

This public repository intentionally contains only anonymized demo content. Real startup names, pitch deck filenames, cohort registers, contact files, Firebase project credentials, Gemini API keys, and private document contents must stay outside GitHub.

The platform uses synthetic startup labels such as `Venture Alpha` and redacted source names to demonstrate workflows without exposing confidential program data.

## Current Prototype Pages

- Overview Dashboard
- Startup List
- Startup Detail
- Contacts
- USI Intelligence
- Incubation Worklist
- Task Detail
- Knowledge Base

## Current Limitations

- MVP demo data works locally before Firebase collections exist.
- Firebase app config is connected, but Auth/Firestore/Storage workflows are not implemented yet.
- Firestore read is connected for demo collections, but create/update workflows are still not implemented in the UI.
- USI Intelligence can use the local Gemini proxy or Firebase callable function scaffold, but real RAG retrieval is not implemented yet.
- Startup data is curated demo data based on available references and should not be treated as verified operational truth.
- AI responses do not update dashboards or startup records.
- Upload UI is a placeholder and does not send files anywhere.
- No role-based access control yet.

## Product Principles Captured

- USI Intelligence is a future RAG assistant for internal USI knowledge and startup support.
- AI must answer with evidence, sources, confidence, missing data, and suggested next actions.
- AI must not make final decisions about startups.
- AI must not directly update dashboard/startup data.
- Future proposed updates must require human approval.
- Vietnam-context evaluation is a core USP and should include local market, regulation, customer behavior, mentors, investors, grants, and ecosystem context.

## Suggested Next Steps

1. Seed Firestore collections: `startups`, `documents`, `projectTasks`, `contacts`, `mentorSessions`, `workshops`, `aiProposals`.
2. Add Firebase Auth and role-based access for SGA, leader, mentor, trainer, founder, alumni, and admin.
3. Build document upload to Firebase Storage and metadata creation in Firestore.
4. Deploy and test Cloud Functions for secure Gemini/RAG calls. Never expose LLM API keys in frontend code.
5. Design proposed-update workflow where AI suggestions require human approval.
6. Add real source extraction and chunking for PDFs, CSV, XLSX, decks, and notes.
7. Test the demo with founders and SGAs before expanding scope.

## Security Note

Firebase web config is public by design, but production safety depends on Firebase Security Rules, Auth, App Check, and restricted API keys. Gemini API keys are secrets and must live in Firebase Functions secrets or another backend secret manager.
