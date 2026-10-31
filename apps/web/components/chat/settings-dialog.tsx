"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Settings } from "@/lib/chat/types";

type Props = {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (patch: Partial<Settings>) => void;
};

const MODELS = ["deepseek-chat", "deepseek-reasoner"];

export function SettingsDialog({ open, settings, onClose, onSave }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // 关闭时整块卸载，下次打开重新挂载 → draft 自然是最新设置，不需要 effect 同步
  return <SettingsForm settings={settings} onClose={onClose} onSave={onSave} />;
}

function SettingsForm({ settings, onClose, onSave }: Omit<Props, "open">) {
  const [draft, setDraft] = useState(settings);

  const field =
    "w-full rounded-md border border-border bg-background px-2.5 py-2 text-[13px] outline-none focus:border-ring";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="设置"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold">连接设置</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              key
              只存在你这个浏览器里，请求经本站代理转发。线上公共部署建议用限额
              key。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded p-1 text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              Base URL
            </span>
            <input
              className={field}
              value={draft.baseUrl}
              onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
              placeholder="https://api.deepseek.com"
              spellCheck={false}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              API Key
            </span>
            <input
              className={field}
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-..."
              spellCheck={false}
              autoComplete="off"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              模型
            </span>
            <input
              className={field}
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              list="model-options"
              spellCheck={false}
            />
            <datalist id="model-options">
              {MODELS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              系统提示（可空）
            </span>
            <textarea
              className={`${field} min-h-[72px] resize-y`}
              value={draft.systemPrompt}
              onChange={(e) =>
                setDraft({ ...draft, systemPrompt: e.target.value })
              }
              placeholder="比如：回答尽量短，先给结论"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
