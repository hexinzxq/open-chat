"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_SETTINGS,
  SUGGESTIONS,
  titleFrom,
  uid,
  type ChatMessage,
  type Conversation,
  type Settings,
} from "@/lib/chat/types";

type State = {
  conversations: Conversation[];
  activeId: string | null;
  settings: Settings;
  streaming: boolean;
  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  patchMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
  ) => void;
  setStreaming: (value: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
};

const touch = (c: Conversation): Conversation => ({
  ...c,
  updatedAt: Date.now(),
});

export const useChatStore = create<State>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      settings: DEFAULT_SETTINGS,
      streaming: false,

      createConversation: () => {
        const now = Date.now();
        const conversation: Conversation = {
          id: uid(),
          title: "新对话",
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          conversations: [conversation, ...s.conversations],
          activeId: conversation.id,
        }));
        return conversation.id;
      },

      selectConversation: (id) => set({ activeId: id }),

      deleteConversation: (id) =>
        set((s) => {
          const left = s.conversations.filter((c) => c.id !== id);
          return {
            conversations: left,
            activeId: s.activeId === id ? (left[0]?.id ?? null) : s.activeId,
          };
        }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c,
          ),
        })),

      appendMessage: (conversationId, message) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const next = touch({ ...c, messages: [...c.messages, message] });
            if (c.messages.length === 0 && message.role === "user") {
              next.title = titleFrom(message.content);
            }
            return next;
          }),
        })),

      patchMessage: (conversationId, messageId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? touch({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m,
                  ),
                })
              : c,
          ),
        })),

      setStreaming: (value) => set({ streaming: value }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "open-chat-v1",
      partialize: (s) => ({
        conversations: s.conversations,
        activeId: s.activeId,
        settings: s.settings,
      }),
    },
  ),
);

export const activeConversation = (s: State) =>
  s.conversations.find((c) => c.id === s.activeId) ?? null;

export { SUGGESTIONS };
