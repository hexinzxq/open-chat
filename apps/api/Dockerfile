FROM ghcr.io/astral-sh/uv:0.11.28 AS uv

FROM python:3.14-slim AS builder

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY --from=uv /uv /uvx /bin/
WORKDIR /app

COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY apps/api ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.14-slim AS runner

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd --system --gid 1001 openchat \
    && useradd --system --uid 1001 --gid openchat --home-dir /app openchat

WORKDIR /app
COPY --from=builder --chown=openchat:openchat /app /app

USER openchat
EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
