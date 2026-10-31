export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  /** 非空表示这条回复失败了，界面上要显示重试 */
  error?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type Settings = {
  /** 兼容任何 OpenAI 协议的端点，默认 DeepSeek */
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
};

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-chat",
  systemPrompt: "",
};

export const SUGGESTIONS = [
  "用三句话解释 Server Components 到底省了什么",
  "帮我审一段 React 代码，重点看闭包陷阱",
  "把这段 SQL 的 N+1 改成一次查询",
  "给这个接口设计一个不会后悔的错误结构",
];

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const titleFrom = (text: string) => {
  const line = text.trim().split("\n")[0] ?? "";
  return line.length > 28 ? `${line.slice(0, 28)}…` : line || "新对话";
};
