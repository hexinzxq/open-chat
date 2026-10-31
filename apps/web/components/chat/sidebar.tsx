"use client";

import { MessageSquare, Plus, Settings, Trash2 } from "lucide-react";

import { useChatStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";

const timeLabel = (ts: number) => {
  const diff = Date.now() - ts;
  const min = 6e4;
  if (diff < min) return "刚刚";
  if (diff < 60 * min) return `${Math.round(diff / min)} 分钟前`;
  if (diff < 24 * 60 * min) return `${Math.round(diff / (60 * min))} 小时前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const createConversation = useChatStore((s) => s.createConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <span className="text-[13px] font-semibold">OC</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            Open Chat
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            streaming · local-first
          </p>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => createConversation()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-elevated px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          新对话
        </button>
      </div>

      <nav
        aria-label="会话列表"
        className="mt-3 flex-1 overflow-y-auto px-2 pb-2"
      >
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs leading-5 text-muted-foreground">
            还没有对话
            <br />
            点上面开一个
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id} className="group relative">
                <button
                  type="button"
                  onClick={() => selectConversation(c.id)}
                  aria-current={activeId === c.id ? "true" : undefined}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2.5 py-2 pr-8 text-left transition-colors",
                    activeId === c.id
                      ? "bg-selected text-foreground"
                      : "text-muted-foreground hover:bg-hover hover:text-foreground",
                  )}
                >
                  <MessageSquare
                    className="mt-0.5 size-3.5 shrink-0 opacity-70"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] leading-5">
                      {c.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {timeLabel(c.updatedAt)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteConversation(c.id)}
                  aria-label={`删除「${c.title}」`}
                  className="absolute right-1.5 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-elevated hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Settings className="size-4" aria-hidden="true" />
          设置
        </button>
      </div>
    </aside>
  );
}
