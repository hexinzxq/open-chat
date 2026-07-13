"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, RefreshCw, Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getApiHealth } from "@/lib/api/health";
import { cn } from "@/lib/utils";
import { useFoundationStore } from "@/stores/foundation";

export function SystemStatus() {
  const detailsOpen = useFoundationStore((state) => state.detailsOpen);
  const toggleDetails = useFoundationStore((state) => state.toggleDetails);
  const health = useQuery({
    queryKey: ["api-health"],
    queryFn: getApiHealth,
    refetchInterval: 15_000,
  });

  const online = health.isSuccess;

  return (
    <aside className="rounded-2xl border bg-card p-6 shadow-xl shadow-foreground/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Runtime status
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            系统基础状态
          </h2>
        </div>
        <span
          className={cn(
            "mt-1 size-3 rounded-full ring-4",
            online
              ? "bg-primary ring-primary/15"
              : "bg-muted-foreground ring-muted",
          )}
          aria-label={online ? "API online" : "API offline"}
        />
      </div>

      <div className="mt-8 space-y-3">
        <StatusRow label="Next.js Web" status="online" />
        <StatusRow
          label="FastAPI"
          status={online ? "online" : health.isPending ? "checking" : "offline"}
        />
      </div>

      <Button
        className="mt-6 w-full justify-between"
        variant="outline"
        onClick={toggleDetails}
        aria-expanded={detailsOpen}
      >
        查看阶段详情
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            detailsOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </Button>

      {detailsOpen ? (
        <div className="mt-4 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
          <p>
            API 地址：
            <code className="ml-1 break-all text-foreground">
              {process.env.NEXT_PUBLIC_API_URL ??
                "http://localhost:8000/api/v1"}
            </code>
          </p>
          <p className="mt-2">
            {online
              ? `后端响应正常：${health.data.status}`
              : "启动 FastAPI 后，这里会自动更新连接状态。"}
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: "checking" | "offline" | "online";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Server className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {status === "online" ? (
          <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
        ) : status === "checking" ? (
          <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <span className="size-2 rounded-full bg-destructive" />
        )}
        {status}
      </span>
    </div>
  );
}
