"use client";

import {
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useChatStore } from "@/lib/chat/store";
import type { Conversation } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

const timeLabel = (ts: number, now: number) => {
  const diff = now - ts;
  const min = 6e4;
  if (diff < min) return "刚刚";
  if (diff < 60 * min) return `${Math.round(diff / min)} 分钟前`;
  if (diff < 24 * 60 * min) return `${Math.round(diff / (60 * min))} 小时前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const isSameDay = (a: number, b: number) => {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
};

type Props = {
  open: boolean;
  onOpenSettings: () => void;
  onNewConversation: () => void;
};

export function Sidebar({ open, onOpenSettings, onNewConversation }: Props) {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const togglePinned = useChatStore((s) => s.togglePinned);

  // 时间只在挂载时取一次，避免渲染期间读时钟
  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? conversations.filter((c) => c.title.toLowerCase().includes(q))
      : conversations;
    const pinned = matched.filter((c) => c.pinned);
    const rest = matched.filter((c) => !c.pinned);
    const today = rest.filter((c) => isSameDay(c.updatedAt, now));
    const older = rest.filter((c) => !isSameDay(c.updatedAt, now));
    return [
      { label: "置顶", items: pinned },
      { label: "今天", items: today },
      { label: "更早", items: older },
    ].filter((g) => g.items.length > 0);
  }, [conversations, now, query]);

  const commitRename = (id: string) => {
    const next = draft.trim();
    if (next) renameConversation(id, next);
    setEditingId(null);
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200",
        open ? "w-[264px]" : "w-0 border-r-0",
      )}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
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
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-elevated px-3 py-2 text-sm font-medium transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          新对话
        </button>
      </div>

      <div className="mt-3 px-3">
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-elevated px-2">
          <Search
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索会话"
            aria-label="搜索会话"
            className="h-8 w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清空搜索"
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="会话列表"
        className="mt-2 flex-1 overflow-y-auto px-2 pb-2"
      >
        {groups.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs leading-5 text-muted-foreground">
            {query ? "没搜到" : "还没有对话，点上面开一个"}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-2">
              <h2 className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    active={activeId === c.id}
                    now={now}
                    editing={editingId === c.id}
                    draft={draft}
                    editRef={editRef}
                    menuOpen={menuId === c.id}
                    onSelect={() => selectConversation(c.id)}
                    onStartRename={() => {
                      setEditingId(c.id);
                      setDraft(c.title);
                      setMenuId(null);
                    }}
                    onDraftChange={setDraft}
                    onCommitRename={() => commitRename(c.id)}
                    onCancelRename={() => setEditingId(null)}
                    onToggleMenu={() =>
                      setMenuId(menuId === c.id ? null : c.id)
                    }
                    onTogglePin={() => {
                      togglePinned(c.id);
                      setMenuId(null);
                    }}
                    onDelete={() => {
                      deleteConversation(c.id);
                      setMenuId(null);
                    }}
                  />
                ))}
              </ul>
            </section>
          ))
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

type RowProps = {
  conversation: Conversation;
  active: boolean;
  now: number;
  editing: boolean;
  draft: string;
  editRef: React.RefObject<HTMLInputElement | null>;
  menuOpen: boolean;
  onSelect: () => void;
  onStartRename: () => void;
  onDraftChange: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onToggleMenu: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
};

function ConversationRow({
  conversation: c,
  active,
  now,
  editing,
  draft,
  editRef,
  menuOpen,
  onSelect,
  onStartRename,
  onDraftChange,
  onCommitRename,
  onCancelRename,
  onToggleMenu,
  onTogglePin,
  onDelete,
}: RowProps) {
  return (
    <li className="group relative">
      {editing ? (
        <div className="px-2 py-1">
          <input
            ref={editRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitRename();
              if (e.key === "Escape") onCancelRename();
            }}
            aria-label="重命名会话"
            className="w-full rounded border border-ring bg-elevated px-2 py-1 text-[13px] outline-none"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "true" : undefined}
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-2.5 py-2 pr-8 text-left transition-colors",
            active
              ? "bg-selected text-foreground"
              : "text-muted-foreground hover:bg-hover hover:text-foreground",
          )}
        >
          {c.pinned ? (
            <Pin
              className="mt-0.5 size-3.5 shrink-0 text-accent"
              aria-label="已置顶"
            />
          ) : (
            <MessageSquare
              className="mt-0.5 size-3.5 shrink-0 opacity-70"
              aria-hidden="true"
            />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-5">
              {c.title}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {timeLabel(c.updatedAt, now)} · {c.messages.length} 条
            </span>
          </span>
        </button>
      )}

      {!editing ? (
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={`「${c.title}」的操作`}
          className="absolute right-1.5 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-elevated hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <MoreHorizontal className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="关闭菜单"
            className="fixed inset-0 z-10 cursor-default"
            onClick={onToggleMenu}
          />
          <div className="absolute right-1 top-8 z-20 w-36 rounded-lg border border-border bg-surface p-1 shadow-xl">
            <button
              type="button"
              onClick={onStartRename}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-muted-foreground hover:bg-hover hover:text-foreground"
            >
              <Pencil className="size-3" aria-hidden="true" />
              重命名
            </button>
            <button
              type="button"
              onClick={onTogglePin}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-muted-foreground hover:bg-hover hover:text-foreground"
            >
              {c.pinned ? (
                <PinOff className="size-3" aria-hidden="true" />
              ) : (
                <Pin className="size-3" aria-hidden="true" />
              )}
              {c.pinned ? "取消置顶" : "置顶"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-destructive hover:bg-hover"
            >
              <Trash2 className="size-3" aria-hidden="true" />
              删除
            </button>
          </div>
        </>
      ) : null}
    </li>
  );
}
