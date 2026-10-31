"use client";

import { useEffect, useRef, useState } from "react";

import { Composer } from "@/components/chat/composer";
import { MessageItem } from "@/components/chat/message-item";
import { Sidebar } from "@/components/chat/sidebar";
import { SettingsDialog } from "@/components/chat/settings-dialog";
import { activeConversation, useChatStore } from "@/lib/chat/store";
import { streamChat } from "@/lib/chat/stream";
import { SUGGESTIONS, uid, type ChatMessage } from "@/lib/chat/types";

export default function Home() {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const settings = useChatStore((s) => s.settings);
  const streaming = useChatStore((s) => s.streaming);
  const createConversation = useChatStore((s) => s.createConversation);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const patchMessage = useChatStore((s) => s.patchMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const updateSettings = useChatStore((s) => s.updateSettings);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useChatStore(activeConversation);
  const hasKey = Boolean(settings.apiKey.trim());

  useEffect(() => {
    if (!activeId && conversations.length === 0) createConversation();
  }, [activeId, conversations.length, createConversation]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages.length, streaming]);

  const run = async (conversationId: string, history: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    const reply = assistantMessage();
    appendMessage(conversationId, reply);

    try {
      let acc = "";
      for await (const delta of streamChat({ messages: history, settings, signal: controller.signal })) {
        acc += delta;
        patchMessage(conversationId, reply.id, { content: acc });
      }
      if (!acc) patchMessage(conversationId, reply.id, { error: "上游没有返回任何内容" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        const current = useChatStore
          .getState()
          .conversations.find((c) => c.id === conversationId)
          ?.messages.find((m) => m.id === reply.id);
        if (!current?.content) patchMessage(conversationId, reply.id, { error: "已停止" });
      } else {
        patchMessage(conversationId, reply.id, { error: err instanceof Error ? err.message : "请求失败" });
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const send = (text: string) => {
    if (!hasKey) {
      setSettingsOpen(true);
      return;
    }
    const id = activeId ?? createConversation();
    const user = userMessage(text);
    appendMessage(id, user);
    const history = useChatStore.getState().conversations.find((c) => c.id === id)?.messages ?? [user];
    void run(id, history);
  };

  const retry = (messageId: string) => {
    if (!conversation || streaming) return;
    const index = conversation.messages.findIndex((m) => m.id === messageId);
    const history = conversation.messages.slice(0, index);
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    patchMessage(conversation.id, messageId, { content: "", error: undefined });
    void run(conversation.id, history);
  };

  const messages = conversation?.messages ?? [];
  const showEmpty = messages.length === 0;

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <h1 className="truncate text-[13px] font-medium text-foreground">{conversation?.title ?? "新对话"}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {settings.model}
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {showEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">问点什么吧</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  前端直连任何 OpenAI 兼容接口。会话留在本机浏览器，不上传。
                </p>
                <div className="mt-7 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-lg border border-border bg-elevated px-3 py-2.5 text-left text-[12.5px] leading-5 text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m, i) => (
                  <MessageItem
                    key={m.id}
                    message={m}
                    streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                    onRetry={m.error ? () => retry(m.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Composer disabled={!hasKey} streaming={streaming} onSend={send} onStop={() => abortRef.current?.abort()} />
      </main>

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={updateSettings}
      />
    </div>
  );
}

// 时间戳在组件外生成，渲染期间不碰 Date.now（react-hooks/purity）
function userMessage(text: string): ChatMessage {
  return { id: uid(), role: "user", content: text, createdAt: Date.now() };
}

function assistantMessage(): ChatMessage {
  return { id: uid(), role: "assistant", content: "", createdAt: Date.now() };
}
