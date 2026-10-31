import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  messages?: { role: string; content: string }[];
};

const DEFAULT_BASE = "https://api.deepseek.com";

/**
 * 代理一层，不要在前端直接拼 key：
 * - 线上部署时 key 仍由使用者自己填，存在他浏览器里
 * - 想换成公司内网网关，改 baseUrl 就行，前端不用动
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const apiKey = body.apiKey?.trim() || process.env.DEEPSEEK_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "还没填 API Key——点左下角设置，或者给部署环境配 DEEPSEEK_API_KEY",
      },
      { status: 401 },
    );
  }
  if (!body.messages?.length) {
    return NextResponse.json({ error: "没有消息可发送" }, { status: 400 });
  }

  const base = (body.baseUrl?.trim() || DEFAULT_BASE).replace(/\/+$/, "");
  const messages = [
    ...(body.systemPrompt?.trim()
      ? [{ role: "system", content: body.systemPrompt }]
      : []),
    ...body.messages,
  ];

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || "deepseek-chat",
        messages,
        stream: true,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `连不上 ${base}：${err instanceof Error ? err.message : "未知网络错误"}`,
      },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    let message =
      text.slice(0, 400) || `${upstream.status} ${upstream.statusText}`;
    try {
      const parsed = JSON.parse(text) as {
        error?: { message?: string } | string;
      };
      const detail =
        typeof parsed.error === "string" ? parsed.error : parsed.error?.message;
      if (detail) message = detail;
    } catch {
      /* 保持原始文本 */
    }
    return NextResponse.json(
      { error: message },
      { status: upstream.status || 502 },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
