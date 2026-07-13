import asyncio
import logging

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.schemas.health import ComponentHealth, HealthResponse, ReadinessResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/live", response_model=HealthResponse, summary="Process liveness")
async def liveness(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    return HealthResponse(service=settings.app_name, version=settings.app_version)


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ReadinessResponse}},
    summary="Dependency readiness",
)
async def readiness(request: Request) -> ReadinessResponse | JSONResponse:
    database, cache = await asyncio.gather(
        _database_health(request),
        _cache_health(request),
    )
    response = ReadinessResponse(
        status="ready" if database.status == cache.status == "ok" else "unavailable",
        checks={"database": database, "cache": cache},
    )

    if response.status == "unavailable":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=response.model_dump(mode="json"),
        )

    return response


async def _database_health(request: Request) -> ComponentHealth:
    try:
        async with request.app.state.db_engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as error:
        logger.warning("Database readiness check failed: %s", error)
        return ComponentHealth(status="error")
    return ComponentHealth(status="ok")


async def _cache_health(request: Request) -> ComponentHealth:
    try:
        await request.app.state.redis.ping()
    except Exception as error:
        logger.warning("Redis readiness check failed: %s", error)
        return ComponentHealth(status="error")
    return ComponentHealth(status="ok")
