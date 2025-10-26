import firebase_admin
import pytest
from fastapi.testclient import TestClient

from main import app, verify_bearer_token


@pytest.fixture(name="client")
def client_fixture():
    """Return a FastAPI test client with Firebase initialization stubbed."""
    firebase_admin._apps = {"test": object()}
    with TestClient(app) as client:
        app.dependency_overrides.clear()
        yield client
    app.dependency_overrides.clear()


def test_hello_requires_auth(client: TestClient):
    response = client.get("/api/hello")
    assert response.status_code == 401


def test_hello_returns_message_when_token_valid(client: TestClient):
    app.dependency_overrides[verify_bearer_token] = lambda: {"name": "Test User"}
    response = client.get("/api/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World, Test User"}
