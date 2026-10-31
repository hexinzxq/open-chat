"use client";

import { Check, Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { PROVIDERS } from "@/lib/chat/providers";
import type { Settings, Theme } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
};

const THEMES: { id: Theme; label: string }[] = [
  { id: "system", label: "跟随系统" },
  { id: "dark", label: "深色" },
  { id: "light", label: "浅色" },
];

export function SettingsDialog({ open, settings, onClose, onSave }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) return null;

  // 关闭时整块卸载，下次打开重新挂载 → 草稿就是最新设置，不需要 effect 同步
  return <SettingsForm settings={settings} onClose={onClose} onSave={onSave} />;
}

function SettingsForm({ settings, onClose, onSave }: Omit<Props, "open">) {
  const [draft, setDraft] = useState(settings);
  const [models, setModels] = useState<string[]>([]);
  const [pulling, setPulling] = useState(false);
  const [pullError, setPullError] = useState<string | null>(null);

  const field =
    "w-full rounded-md border border-border bg-elevated px-2.5 py-1.5 text-[13px] outline-none focus:border-ring";

  const pullModels = async () => {
    setPulling(true);
    setPullError(null);
    try {
      const base = (draft.baseUrl || "").replace(/\/+$/, "");
      if (!base) throw new Error("先填 Base URL");
      const res = await fetch(`${base}/models`, {
        headers: { authorization: `Bearer ${draft.apiKey}` },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = (await res.json()) as { data?: { id?: string }[] };
      const ids = (data.data ?? [])
        .map((m) => m.id)
        .filter((id): id is string => Boolean(id));
      if (!ids.length) throw new Error("接口没返回模型");
      setModels(ids);
    } catch (err) {
      setPullError(err instanceof Error ? err.message : "拉取失败");
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
      <button
        type="button"
        aria-label="关闭设置"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold">设置</h2>
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
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
              端点预设
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      baseUrl: p.baseUrl,
                      model: p.models[0]?.id ?? draft.model,
                    })
                  }
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[12px] transition-colors",
                    p.baseUrl && p.baseUrl === draft.baseUrl
                      ? "border-ring bg-selected text-foreground"
                      : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

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

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                模型
              </span>
              <button
                type="button"
                onClick={pullModels}
                disabled={pulling}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground disabled:opacity-50"
              >
                <Download className="size-3" aria-hidden="true" />
                {pulling ? "拉取中…" : "从接口拉取"}
              </button>
            </div>
            <input
              className={field}
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              placeholder="deepseek-chat"
              spellCheck={false}
            />
            {models.length > 0 ? (
              <div className="mt-1.5 flex max-h-28 flex-wrap gap-1 overflow-y-auto">
                {models.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDraft({ ...draft, model: id })}
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[11px]",
                      id === draft.model
                        ? "border-ring bg-selected text-foreground"
                        : "border-border text-muted-foreground hover:bg-hover",
                    )}
                  >
                    {id}
                  </button>
                ))}
              </div>
            ) : null}
            {pullError ? (
              <p className="mt-1 text-[11px] text-destructive">{pullError}</p>
            ) : null}
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              温度 · {draft.temperature.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={draft.temperature}
              onChange={(e) =>
                setDraft({ ...draft, temperature: Number(e.target.value) })
              }
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
              主题
            </span>
            <div className="flex gap-1.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, theme: t.id })}
                  className={cn(
                    "flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] transition-colors",
                    draft.theme === t.id
                      ? "border-ring bg-selected text-foreground"
                      : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
                  )}
                >
                  {draft.theme === t.id ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : null}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

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
            className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
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
