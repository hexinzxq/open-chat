import { Bot, Braces, Database, MessagesSquare } from "lucide-react";

import { SystemStatus } from "@/components/system-status";

const capabilities = [
  {
    icon: MessagesSquare,
    title: "Streaming chat",
    description: "流式对话与历史会话将在后续阶段接入。",
  },
  {
    icon: Bot,
    title: "Provider neutral",
    description: "为 OpenAI、Claude、Gemini 与 DeepSeek 预留统一边界。",
  },
  {
    icon: Database,
    title: "Data ready",
    description: "PostgreSQL、Redis、SQLAlchemy 与 Alembic 基础设施已就绪。",
  },
  {
    icon: Braces,
    title: "Extensible",
    description: "文件、搜索、RAG、MCP 和 Agent 将按阶段演进。",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-10 sm:py-16">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MessagesSquare className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Open Chat</p>
            <p className="text-xs text-muted-foreground">
              Foundation · Phase 1
            </p>
          </div>
        </div>
        <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          Monorepo online
        </span>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Production-minded AI assistant
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            从可运行的基础开始，逐步构建生产级 AI 聊天助手。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            当前阶段建立清晰的
            Web、API、数据库和缓存边界。每个后续能力都将在独立、可验证的提交中加入。
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border bg-card/80 p-5 shadow-sm backdrop-blur"
              >
                <Icon className="mb-4 size-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <SystemStatus />
      </section>
    </main>
  );
}
