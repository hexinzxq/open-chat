from typing import Literal

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: Literal["ok"] = "ok"
    service: str
    version: str


class ComponentHealth(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: Literal["ok", "error"]


class ReadinessResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: Literal["ready", "unavailable"]
    checks: dict[str, ComponentHealth]
