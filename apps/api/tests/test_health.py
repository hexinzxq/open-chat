from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_liveness_returns_service_metadata() -> None:
    settings = Settings(
        _env_file=None,
        app_env="test",
        app_name="test-api",
        app_version="test-version",
    )

    with TestClient(create_app(settings)) as client:
        response = client.get("/api/v1/health/live")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "test-api",
        "version": "test-version",
    }


def test_openapi_exposes_health_routes() -> None:
    settings = Settings(_env_file=None, app_env="test")

    with TestClient(create_app(settings)) as client:
        response = client.get("/openapi.json")

    paths = response.json()["paths"]
    assert "/api/v1/health/live" in paths
    assert "/api/v1/health/ready" in paths
