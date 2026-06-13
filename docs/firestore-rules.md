# Firestore Rules

Current prototype rules are in:

```text
firestore.rules
```

## Current Rule Strategy

For demo speed, these collections are publicly readable:

- `platformConfig`
- `programs`
- `cohorts`
- `startups`
- `documents`
- `projectTasks`
- `aiInsights`
- `sourceFiles`
- `founderQuestions`
- `workshops`

Writes are restricted:

- `programs`, `cohorts`, `startups`, `documents`, `projectTasks`, `aiInsights`, `sourceFiles`, `workshops`: staff/admin roles only.
- `founderQuestions`: signed-in users can create; staff can moderate.
- `mentorSessions`: staff or linked startup users can read; staff can write.
- `aiProposals`: signed-in users can create pending proposals; staff can approve/review; admin can delete.
- `users`: user can read/write own profile; admin can manage all.

## Expected Custom Claims

The rules expect optional Firebase Auth custom claims:

```json
{
  "role": "admin | leader | sga | program | mentor | trainer | founder | alumni",
  "startupIds": ["skyholic", "ecombox"],
  "admin": true
}
```

These claims are not implemented yet. Until Auth is ready, seed data should be written with Firebase Admin SDK, which bypasses rules.

## Deploy Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Storage is intentionally not included in `firebase.json` right now, so Firestore deploys will not touch it. If Firebase Storage is needed later, initialize Storage in Firebase Console > Storage > Get Started, add this block back to `firebase.json`:

```json
"storage": {
  "rules": "storage.rules"
}
```

Then deploy:

```bash
firebase deploy --only storage
```

## Seed Demo Collections

```bash
cd functions
npm install
npm run seed:firestore
cd ..
```

The seed script uses Firebase Admin SDK. For local seeding into live Firestore, set Application Default Credentials or a service account first:

```bash
gcloud auth application-default login
```

or:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
```

After seeding, Firestore should show:

- `platformConfig`
- `programs`
- `cohorts`
- `startups`
- `documents`
- `projectTasks`
- `founderQuestions`
- `mentorSessions`
- `workshops`
- `aiInsights`
- `aiProposals`
- `sourceFiles`

## Production Hardening

Before production, change public reads to `signedIn()` or role-based rules, enable App Check, restrict API keys, and add audit logging for sensitive writes.
