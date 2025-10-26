# Frontend (Next.js) — Login UI for GCIP

This Next.js app demonstrates Email/Password login against Google Cloud Identity Platform / Firebase Auth and calls a protected FastAPI backend with the ID token.

Setup
1. Copy `.env.local.example` to `.env.local` and confirm values. Replace any placeholder values if needed.

   cp .env.local.example .env.local

2. Install dependencies and run the dev server:

   npm install
   npm run dev

3. Create an Email/Password user in your Firebase / GCIP console (or use the Admin SDK to create one). Ensure Email/Password provider is enabled.

How it works
- The client uses `firebase/auth` to sign in with email/password.
- After sign-in it calls `user.getIdToken()` to get the ID token (JWT).
- The token is stored in a React Context and persisted to `localStorage` so it survives reloads.
- When you click "Call Protected API", the client sends `Authorization: Bearer <idToken>` to the backend.

Environment variables in `.env.local` (from `.env.local.example`):
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- NEXT_PUBLIC_API_BASE (e.g., http://localhost:8000)

Notes
- Do not commit `.env.local` or your service account JSON to source control.
- The frontend is intentionally simple and focuses on the auth flow. For production, add nicer UX, error handling, and token refresh logic if needed.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
