# Open Chat

面向生产环境演进的开源 AI 聊天助手。项目采用 Monorepo，前端为 Next.js App Router，后端为 FastAPI，并以 PostgreSQL 与 Redis 作为持久化和缓存基础设施。

> 当前进度：阶段 1（可运行工程骨架）。聊天与 AI 能力会在后续阶段按可运行提交逐步加入。

## 技术栈

- Web：Next.js 16、React 19、TypeScript、Tailwind CSS 4、shadcn/ui 组件约定、TanStack Query、Zustand
- API：FastAPI、Pydantic v2、SQLAlchemy 2、Alembic、PostgreSQL、Redis、uv
- 工程：pnpm workspace、Docker Compose、GitHub Actions、ESLint、Prettier、Ruff、pytest

## 本地开发

需要 Node.js 24、pnpm 10、Python 3.14、[uv](https://docs.astral.sh/uv/) 和 Docker。

```bash
cp .env.example .env
pnpm install
cd apps/api && uv sync && cd ../..
docker compose up -d postgres redis
pnpm dev
```

启动后可访问：

- Web：http://localhost:3000
- API 文档：http://localhost:8000/docs
- 存活检查：http://localhost:8000/api/v1/health/live
- 就绪检查：http://localhost:8000/api/v1/health/ready

也可以完全使用容器启动：

```bash
cp .env.example .env
docker compose up --build
```

`.env.example` 中的数据库口令仅供本地开发使用，部署时必须通过密钥管理服务覆盖。

## 常用命令

```bash
pnpm dev           # 同时启动 Web 与 API
pnpm lint          # ESLint + Ruff
pnpm typecheck     # Web TypeScript 检查
pnpm test          # API 测试
pnpm build         # Web 生产构建
pnpm format:check  # Prettier + Ruff 格式检查
```

数据库迁移：

```bash
cd apps/api
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "describe change"
```

## 目录结构

```text
apps/
  web/             Next.js App Router 前端
  api/             FastAPI API、数据库与缓存基础设施
.github/workflows/ 持续集成
compose.yaml       本地完整技术栈
```

## 分阶段路线图

每个阶段保持可安装、可测试、可启动，并单独提交：

1. **工程骨架（当前）**：Monorepo、Web/API、健康检查、PostgreSQL、Redis、容器与 CI。
2. **会话数据层**：用户与会话模型、消息持久化、Alembic 迁移、历史会话 API。
3. **统一 AI Provider**：OpenAI、Claude、Gemini、DeepSeek 适配器，模型目录、模型切换与流式聊天。
4. **文件与多模态**：安全上传、文档解析、对象存储抽象、图片理解。
5. **搜索与 RAG**：联网搜索、文档切分、向量检索、知识库管理与引用。
6. **工具与生产加固**：MCP/Agent 扩展点、可观测性、限流、审计、安全和部署基线。

后续阶段不会提前混入当前提交，避免产生无法验证的大爆炸式变更。
