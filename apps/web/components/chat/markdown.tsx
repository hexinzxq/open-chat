"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type Props = { content: string; className?: string };

/**
 * 只在必要的地方接管样式，其余交给 markdown 默认渲染。
 * 代码块用 pre > code 自己包一层，避免长行把布局撑破。
 */
export function Markdown({ content, className }: Props) {
  return (
    <div className={cn("chat-markdown", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
              {children}
            </a>
          ),
          pre: ({ children, ...props }) => (
            <pre className="chat-code" {...props}>
              {children}
            </pre>
          ),
          code: ({ className: cls, children, ...props }: ComponentPropsWithoutRef<"code">) => {
            const isBlock = Boolean(cls?.includes("language-")) || String(children).includes("\n");
            return (
              <code className={cn(isBlock ? "chat-code-block" : "chat-code-inline", cls)} {...props}>
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className="chat-table-wrap">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
