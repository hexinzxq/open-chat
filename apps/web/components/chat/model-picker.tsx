"use client";

import { Check, ChevronDown, Settings2 } from "lucide-react";
import { useState } from "react";

import { PROVIDERS, providerOf } from "@/lib/chat/providers";
import type { ModelProfile, Settings } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type Props = {
  settings: Settings;
  profiles: ModelProfile[];
  onChange: (patch: Partial<Settings>) => void;
  onApplyProfile: (id: string) => void;
  onOpenSettings: () => void;
  /** 聊天框里用小的，顶栏用正常尺寸 */
  compact?: boolean;
};

export function ModelPicker({
  settings,
  profiles,
  onChange,
  onApplyProfile,
  onOpenSettings,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const provider = providerOf(settings.baseUrl);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex max-w-[46vw] items-center gap-1.5 rounded-md border border-border transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact
            ? "px-2 py-1 text-[11px] text-muted-foreground"
            : "px-2.5 py-1.5 text-[12px] text-muted-foreground",
        )}
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-accent"
          aria-hidden="true"
        />
        <span className="truncate">{settings.model || "选模型"}</span>
        <ChevronDown
          className="size-3 shrink-0 opacity-60"
          aria-hidden="true"
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="关闭模型列表"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute z-20 w-72 rounded-lg border border-border bg-surface p-1.5 shadow-xl",
              compact ? "bottom-full left-0 mb-1.5" : "right-0 mt-1.5",
            )}
          >
            {profiles.length > 0 ? (
              <>
                <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  我的配置
                </p>
                {profiles.map((p) => {
                  const active =
                    p.baseUrl === settings.baseUrl &&
                    p.model === settings.model;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onApplyProfile(p.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors",
                        active
                          ? "bg-selected text-foreground"
                          : "text-muted-foreground hover:bg-hover",
                      )}
                    >
                      <span className="min-w-0 truncate">{p.name}</span>
                      <span className="shrink-0 text-[10px] opacity-70">
                        {p.model}
                      </span>
                      {active ? (
                        <Check className="size-3 shrink-0" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </>
            ) : null}

            <p className="mt-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              端点
            </p>
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange({
                    baseUrl: p.baseUrl,
                    model: p.models[0]?.id ?? settings.model,
                  });
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
                  <Check className="size-3" aria-hidden="true" />
                ) : null}
              </button>
            ))}

            {provider.models.length > 0 ? (
              <>
                <p className="mt-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  模型
                </p>
                <div className="max-h-56 overflow-y-auto">
                  {provider.models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange({ model: m.id });
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
                </div>
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
              管理配置…
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
