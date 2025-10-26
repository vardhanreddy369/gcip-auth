import os
import json
from typing import Dict, Any

from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth


def _init_firebase_app() -> None:
    # Support either a path to a service account JSON file (via
    # GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH) or
    # a JSON string in FIREBASE_SERVICE_ACCOUNT_JSON.
    if firebase_admin._apps:
        return

    sa_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") or os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
    sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")

    cred = None
    if sa_path and os.path.exists(sa_path):
        cred = credentials.Certificate(sa_path)
    elif sa_json:
        try:
            info = json.loads(sa_json)
            cred = credentials.Certificate(info)
        except Exception as e:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is set but not valid JSON") from e
    else:
        # Let firebase-admin attempt the default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS)
        try:
            cred = credentials.ApplicationDefault()
        except Exception:
            raise RuntimeError(
                "No Firebase service account configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON."
            )

    firebase_admin.initialize_app(cred)


app = FastAPI(title="GCIP Protected API")

# CORS - allow the frontend origin (default http://localhost:3000)
frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    _init_firebase_app()


def _unauthorized(detail: str = "Unauthorized") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


async def verify_bearer_token(request: Request) -> Dict[str, Any]:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise _unauthorized("Missing Authorization header")

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise _unauthorized("Malformed Authorization header")

    token = parts[1]
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception as e:
        # Do not leak internal details
        raise _unauthorized("Invalid or expired token") from e


@app.get("/api/hello")
def hello(payload: Dict[str, Any] = Depends(verify_bearer_token)):
    name = payload.get("name") or payload.get("displayName") or payload.get("email") or "user"
    return {"message": f"Hello World, {name}"}
