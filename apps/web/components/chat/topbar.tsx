"use client";

import { Command, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { ModelPicker } from "@/components/chat/model-picker";
import type { Conversation, ModelProfile, Settings } from "@/lib/chat/types";

type Props = {
  conversation: Conversation | null;
  settings: Settings;
  profiles: ModelProfile[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
  onChange: (patch: Partial<Settings>) => void;
  onApplyProfile: (id: string) => void;
};

export function Topbar({
  conversation,
  settings,
  profiles,
  sidebarOpen,
  onToggleSidebar,
  onOpenPalette,
  onOpenSettings,
  onChange,
  onApplyProfile,
}: Props) {
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

      <ModelPicker
        settings={settings}
        profiles={profiles}
        onChange={onChange}
        onApplyProfile={onApplyProfile}
        onOpenSettings={onOpenSettings}
      />

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
