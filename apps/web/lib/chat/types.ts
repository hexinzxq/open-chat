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
  pinned?: boolean;
};

export type Theme = "dark" | "light" | "system";

/** 一套可以一键切换的端点配置（地址 + key + 模型） */
export type ModelProfile = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type Settings = {
  /** 兼容任何 OpenAI 协议的端点，默认 DeepSeek */
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  theme: Theme;
  /** 0–2，默认 0.7；部分推理模型不接受这个参数，会有提示 */
  temperature: number;
  profiles: ModelProfile[];
};

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-chat",
  systemPrompt: "",
  theme: "system",
  temperature: 0.7,
  profiles: [],
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
