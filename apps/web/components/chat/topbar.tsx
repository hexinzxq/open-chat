"use client";

import {
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from "lucide-react";
import { useState } from "react";

import { PROVIDERS, providerOf } from "@/lib/chat/providers";
import type { Conversation, Settings } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type Props = {
  conversation: Conversation | null;
  settings: Settings;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
  onModelChange: (model: string) => void;
  onBaseChange: (baseUrl: string) => void;
};

export function Topbar({
  conversation,
  settings,
  sidebarOpen,
  onToggleSidebar,
  onOpenPalette,
  onOpenSettings,
  onModelChange,
  onBaseChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const provider = providerOf(settings.baseUrl);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "收起侧栏" : "展开侧栏"}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {sidebarOpen ? (
          <PanelLeftClose className="size-4" />
        ) : (
          <PanelLeftOpen className="size-4" />
        )}
      </button>

      <h1 className="min-w-0 flex-1 truncate text-[13px] font-medium">
        {conversation?.title ?? "新对话"}
      </h1>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span
            className="size-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          <span className="max-w-[42vw] truncate">
            {settings.model || "未选模型"}
          </span>
        </button>

        {open ? (
          <>
            <button
              type="button"
              aria-label="关闭模型列表"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-1.5 w-64 rounded-lg border border-border bg-surface p-1.5 shadow-xl">
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                端点
              </p>
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onBaseChange(p.baseUrl);
                    if (p.models[0]) onModelChange(p.models[0].id);
                    if (p.id !== "custom") setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] transition-colors",
                    p.id === provider.id
                      ? "bg-selected text-foreground"
                      : "text-muted-foreground hover:bg-hover",
                  )}
                >
                  <span>{p.label}</span>
                  {p.id === provider.id ? (
                    <span className="text-[10px]">✓</span>
                  ) : null}
                </button>
              ))}

              {provider.models.length > 0 ? (
                <>
                  <p className="mt-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    模型
                  </p>
                  {provider.models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onModelChange(m.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "block w-full truncate rounded-md px-2 py-1.5 text-left text-[12px] transition-colors",
                        m.id === settings.model
                          ? "bg-selected text-foreground"
                          : "text-muted-foreground hover:bg-hover",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenSettings();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
              >
                <Settings2 className="size-3.5" aria-hidden="true" />
                更多设置…
              </button>
            </div>
          </>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenPalette}
        className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
        aria-label="打开命令面板"
      >
        <Command className="size-3.5" aria-hidden="true" />K
      </button>
    </header>
  );
}
