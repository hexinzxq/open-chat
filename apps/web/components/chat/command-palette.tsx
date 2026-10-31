"use client";

import {
  CornerDownLeft,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Conversation, Theme } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  theme: Theme;
  onNew: () => void;
  onSelect: (id: string) => void;
  onOpenSettings: () => void;
  onCycleTheme: () => void;
};

export function CommandPalette({
  open,
  onClose,
  conversations,
  activeId,
  theme,
  onNew,
  onSelect,
  onOpenSettings,
  onCycleTheme,
}: Props) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = useMemo<Action[]>(
    () => [
      {
        id: "new",
        label: "新建对话",
        hint: "N",
        icon: <Plus className="size-3.5" />,
        run: onNew,
      },
      {
        id: "settings",
        label: "打开设置",
        hint: ",",
        icon: <Settings className="size-3.5" />,
        run: onOpenSettings,
      },
      {
        id: "theme",
        label: "切换主题",
        hint:
          theme === "dark"
            ? "当前 深色"
            : theme === "light"
              ? "当前 浅色"
              : "当前 跟随系统",
        icon:
          theme === "light" ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          ),
        run: onCycleTheme,
      },
    ],
    [onNew, onOpenSettings, onCycleTheme, theme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const convs = conversations
      .filter((c) => (q ? c.title.toLowerCase().includes(q) : true))
      .slice(0, 6)
      .map<Action>((c) => ({
        id: `conv:${c.id}`,
        label: c.title,
        hint: activeId === c.id ? "当前" : "会话",
        icon: <MessageSquare className="size-3.5" />,
        run: () => onSelect(c.id),
      }));
    const acts = actions.filter((a) =>
      q ? a.label.toLowerCase().includes(q) : true,
    );
    return [...acts, ...convs];
  }, [actions, activeId, conversations, onSelect, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => (results.length ? (c + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) =>
          results.length ? (c - 1 + results.length) % results.length : 0,
        );
      } else if (e.key === "Enter") {
        const picked = results[cursor];
        if (picked) {
          e.preventDefault();
          picked.run();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, onClose, open, results]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-[14vh] backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <span className="text-muted-foreground" aria-hidden="true">
            ⌘
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="跳转会话、执行命令…"
            aria-label="命令面板"
            className="h-11 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <ul
          role="listbox"
          aria-label="结果"
          className="max-h-[46vh] overflow-y-auto p-1.5"
        >
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              没有匹配的东西
            </li>
          ) : (
            results.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                    i === cursor
                      ? "bg-selected text-foreground"
                      : "text-muted-foreground hover:bg-hover",
                  )}
                >
                  <span className="opacity-70" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint ? (
                    <span className="text-[11px] text-muted-foreground">
                      {item.hint}
                    </span>
                  ) : null}
                  {i === cursor ? (
                    <CornerDownLeft
                      className="size-3 opacity-60"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
