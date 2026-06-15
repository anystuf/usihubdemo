# Public Data Policy

This repository is a public demo repository. It must not contain confidential startup data.

## Allowed in GitHub

- Static platform UI code.
- Anonymized demo data using labels like `Venture Alpha`.
- Redacted document metadata.
- Public-safe setup documentation.
- Public brand assets approved for demo use.

## Not Allowed in GitHub

- Real pitch decks, roadmaps, contracts, cohort registers, mentor notes, email/contact exports, financial data, customer lists, IP details, or founder personal data.
- Gemini API keys, Firebase service account keys, `.env.local`, or production Firebase config.
- Full text extracted from confidential documents.
- Raw Firestore or Storage exports.

## AI Data Rule

USI Brain must not send full confidential documents to Gemini from the public demo. Production RAG should send only approved, redacted snippets through a backend, with audit logs and human approval.

## Production Storage Rule

Real startup data should live in private Firebase/Google Cloud resources with Auth, Firestore rules, Storage rules, App Check, and document-level AI permissions.
