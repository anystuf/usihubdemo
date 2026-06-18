# Firebase Setup

## Frontend

Firebase Web SDK is initialized in:

```text
public/js/services/firebaseService.js
```

Configured services:

- App
- Analytics
- Auth
- Firestore
- Storage
- Functions

## Required Firebase Account

Deploy and seed from the Firebase CLI account:

```text
YOUR_FIREBASE_ACCOUNT_EMAIL
```

The project is pinned in `.firebaserc`:

```text
YOUR_FIREBASE_PROJECT_ID
```

Check before deploy:

```bash
firebase login:list
firebase use
cd functions
npm run preflight:firebase-account
cd ..
```

If the wrong account is active:

```bash
firebase login --reauth
firebase use YOUR_FIREBASE_PROJECT_ID
```

## Gemini Secret

Do not put the Gemini API key in frontend code.

Set it as a Firebase Functions secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Then deploy:

```bash
firebase deploy --only functions
```

## Spark Plan Workaround For Demo

Firebase Spark cannot enable Secret Manager for Functions. For local demos without upgrading to Blaze, use the local proxy:

```bash
copy .env.local.example .env.local
```

Set:

```text
GEMINI_API_KEY=your_key_here
PORT=4173
```

Run:

```bash
npm run dev
```

The app calls `/api/usi-brain` first. If the local proxy is not running, it tries Firebase Function, then local fallback data.

## USI Intelligence Function

Callable function:

```text
askUsiBrain
```

Model:

```text
gemini-3.5-flash
```

The function returns:

- `answer`
- `evidence`
- `sources`
- `confidence`
- `missingData`
- `nextActions`

## Firestore Rules And Seed Data

Rules live at:

```text
firestore.rules
storage.rules
```

Deploy Firestore rules and indexes first:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Firebase Storage is parked for later and is not currently included in `firebase.json`. Firebase Storage must be initialized once in the Firebase Console before Storage rules can deploy:

```text
Firebase Console > Storage > Get Started
```

After Storage is set up, add this block back to `firebase.json`:

```json
"storage": {
  "rules": "storage.rules"
}
```

Then deploy Storage rules separately:

```bash
firebase deploy --only storage
```

Seed demo content:

```bash
cd functions
npm install
npm run seed:firestore
cd ..
```

Or seed from the local UI:

```bash
npm run dev
```

Then open Knowledge Base and click **Seed Firestore**.

For live Firestore seeding, Firebase Admin SDK needs credentials. Use either:

```bash
gcloud auth application-default login
```

or:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
```

The frontend reads Firestore collections first and falls back to local demo data if Firestore is empty or unavailable.

## Security Checklist Before Production

- Enable Firebase Auth.
- Add Firestore and Storage rules.
- Add App Check.
- Restrict Firebase API key in Google Cloud console.
- Keep Gemini key in Secret Manager only.
- Add logging and abuse limits for `askUsiBrain`.
- Store AI outputs as proposals, not direct data mutations.
