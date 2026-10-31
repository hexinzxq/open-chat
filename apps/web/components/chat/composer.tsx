"use client";

import { ArrowUp, Loader2, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  disabled?: boolean;
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function Composer({ disabled, streaming, onSend, onStop }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // 高度跟着内容走，最多 8 行
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-elevated p-2 shadow-sm focus-within:border-ring">
          <textarea
            ref={ref}
            value={value}
            rows={1}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={disabled ? "先去设置里填 API Key" : "说点什么，Enter 发送，Shift+Enter 换行"}
            disabled={disabled}
            aria-label="输入消息"
            className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex size-8 items-center justify-center rounded-lg bg-elevated text-foreground ring-1 ring-border transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="停止生成"
            >
              <Square className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() || disabled}
              className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="发送"
            >
              {disabled ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ArrowUp className="size-4" aria-hidden="true" />}
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          会话存在这台设备的浏览器里 · 用你自己的 key 调上游
        </p>
      </div>
    </div>
  );
}
