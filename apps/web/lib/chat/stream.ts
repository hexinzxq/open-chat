import type { ChatMessage, Settings } from "@/lib/chat/types";

type StreamArgs = {
  messages: ChatMessage[];
  settings: Settings;
  signal?: AbortSignal;
};

const payloadOf = ({ messages, settings }: StreamArgs) => ({
  baseUrl: settings.baseUrl,
  apiKey: settings.apiKey,
  model: settings.model,
  systemPrompt: settings.systemPrompt,
  temperature: settings.temperature,
  messages: messages.map(({ role, content }) => ({ role, content })),
});

/**
 * 两条路：
 * 1) 本站有服务端（next dev / Vercel）→ 走 /api/chat 代理，key 不拼进浏览器请求
 * 2) 纯静态托管（GitHub Pages）→ 没有 /api，直连上游（DeepSeek 允许 CORS）
 */
async function openStream(args: StreamArgs): Promise<Response> {
  const body = JSON.stringify(payloadOf(args));

  try {
    const proxied = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: args.signal,
      body,
    });
    if (proxied.ok) return proxied;
    if (proxied.status !== 404 && proxied.status !== 405) return proxied;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // 网络层就挂了，继续试直连
  }

  const base = (args.settings.baseUrl || "https://api.deepseek.com").replace(
    /\/+$/,
    "",
  );
  const system = args.settings.systemPrompt?.trim();
  return fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${args.settings.apiKey}`,
    },
    signal: args.signal,
    body: JSON.stringify({
      model: args.settings.model || "deepseek-chat",
      stream: true,
      temperature: args.settings.temperature,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...args.messages.map(({ role, content }) => ({ role, content })),
      ],
    }),
  });
}

async function* parseSSE(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let index = buffer.indexOf("\n\n");
    while (index !== -1) {
      const chunk = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      index = buffer.indexOf("\n\n");

      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
            error?: { message?: string };
          };
          if (json.error?.message) throw new Error(json.error.message);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch (err) {
          if (err instanceof SyntaxError) continue;
          throw err;
        }
      }
    }
  }
}

export async function* streamChat(args: StreamArgs): AsyncGenerator<string> {
  const res = await openStream(args);

  if (!res.ok || !res.body) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const data = (await res.json()) as {
        error?: string | { message?: string };
      };
      const raw = data?.error;
      const message = typeof raw === "string" ? raw : raw?.message;
      if (message) detail = message;
    } catch {
      /* 非 JSON 就用状态码 */
    }
    throw new Error(detail);
  }

  yield* parseSSE(res);
}
