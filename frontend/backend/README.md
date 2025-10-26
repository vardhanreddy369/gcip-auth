# Backend (FastAPI) — Protected API using Firebase Admin

This backend exposes a single protected endpoint: `GET /api/hello`.
It validates Firebase ID tokens (JWTs) issued by Google Cloud Identity Platform / Firebase Auth using the `firebase-admin` SDK.

Prereqs
- Python 3.10+
- A Firebase / Google Cloud service account JSON for a project configured to use Identity Platform (or Firebase Auth).

Setup
1. Create a Python virtualenv and install deps:

   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

2. Provide service account credentials. You can either:

   - Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account JSON file; or
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` to the path; or
   - Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the literal JSON content of the service account (less common).

   Example (macOS / zsh):

   export FIREBASE_SERVICE_ACCOUNT_PATH="$HOME/secrets/my-firebase-sa.json"
   export FRONTEND_ORIGIN="http://localhost:3000"

Run

   # inside the virtualenv
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

The backend will be available at http://localhost:8000.

How it works
- On startup the backend initializes the Firebase Admin SDK using the provided credentials.
- The dependency `verify_bearer_token` extracts the `Authorization: Bearer <token>` header and calls `firebase_admin.auth.verify_id_token`.
- If the token is valid, the decoded token payload is injected into the endpoint. If invalid/expired, the API responds with `401 Unauthorized`.

Testing with the frontend
- Ensure the frontend (Next.js) is configured with your Firebase web app credentials (see frontend README) and `NEXT_PUBLIC_API_BASE` pointing to `http://localhost:8000`.
- Use the login page to sign in with an Email/Password user. After sign-in, the frontend will call `/api/hello` with the ID token in the Authorization header.

Security notes
- Do not commit your service account JSON to source control.
- In production, restrict allowed origins and follow least-privilege principles for the service account.
