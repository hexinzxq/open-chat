"use client";

import { AlertTriangle, Bot, RefreshCw, User } from "lucide-react";

import { Markdown } from "@/components/chat/markdown";
import type { ChatMessage } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

type Props = {
  message: ChatMessage;
  streaming?: boolean;
  onRetry?: () => void;
};

export function MessageItem({ message, streaming, onRetry }: Props) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "group flex gap-3 px-1",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border",
          isUser
            ? "bg-elevated text-muted-foreground"
            : "bg-accent text-accent-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div
        className={cn(
          "min-w-0 max-w-[min(100%,680px)]",
          isUser && "text-right",
        )}
      >
        {isUser ? (
          <div className="inline-block rounded-lg border border-accent/25 bg-accent/15 px-3 py-2 text-left text-[14px] leading-6 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <div className="text-[14px] leading-7">
            {message.content ? (
              <Markdown content={message.content} />
            ) : streaming ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </span>
            ) : null}
          </div>
        )}

        {message.error ? (
          <div className="mt-2 inline-flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-left text-[12px] leading-5 text-destructive">
            <AlertTriangle
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span className="break-words">{message.error}</span>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="ml-1 inline-flex shrink-0 items-center gap-1 underline underline-offset-2 hover:no-underline"
              >
                <RefreshCw className="size-3" aria-hidden="true" />
                重试
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
