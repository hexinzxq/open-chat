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
  togglePinned: (id: string) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  patchMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
  ) => void;
  setStreaming: (value: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  saveProfile: (name: string) => void;
  applyProfile: (id: string) => void;
  removeProfile: (id: string) => void;
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

      togglePinned: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c,
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

      saveProfile: (name) =>
        set((s) => {
          const { baseUrl, apiKey, model } = s.settings;
          const trim = name.trim() || model || "未命名";
          const existing = s.settings.profiles.find(
            (p) => p.baseUrl === baseUrl && p.model === model,
          );
          const profiles = existing
            ? s.settings.profiles.map((p) =>
                p.id === existing.id ? { ...p, name: trim, apiKey } : p,
              )
            : [
                ...s.settings.profiles,
                { id: uid(), name: trim, baseUrl, apiKey, model },
              ];
          return { settings: { ...s.settings, profiles } };
        }),

      applyProfile: (id) =>
        set((s) => {
          const profile = s.settings.profiles.find((p) => p.id === id);
          if (!profile) return {};
          return {
            settings: {
              ...s.settings,
              baseUrl: profile.baseUrl,
              apiKey: profile.apiKey,
              model: profile.model,
            },
          };
        }),

      removeProfile: (id) =>
        set((s) => ({
          settings: {
            ...s.settings,
            profiles: s.settings.profiles.filter((p) => p.id !== id),
          },
        })),
    }),
    {
      name: "open-chat-v1",
      // 老版本存下来的 settings 没有 theme/temperature，缺的字段用默认值补上
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...saved,
          settings: { ...current.settings, ...(saved.settings ?? {}) },
        };
      },
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
