export type ModelOption = {
  id: string;
  label: string;
};

export type Provider = {
  id: string;
  label: string;
  baseUrl: string;
  models: ModelOption[];
  note?: string;
};

/**
 * 常见端点预设。模型名各家会变，这里只放长期有效的；对不上就去设置里手填，
 * 或者用「从接口拉取」把 /models 返回的列表读回来。
 */
export const PROVIDERS: Provider[] = [
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    models: [
      { id: "deepseek-chat", label: "deepseek-chat" },
      { id: "deepseek-reasoner", label: "deepseek-reasoner" },
    ],
  },
  {
    id: "kimi",
    label: "Kimi · Moonshot",
    baseUrl: "https://api.moonshot.cn/v1",
    models: [
      { id: "kimi-k2.7", label: "kimi-k2.7" },
      { id: "kimi-k2.6", label: "kimi-k2.6" },
      { id: "kimi-k2.5", label: "kimi-k2.5" },
      { id: "moonshot-v1-32k", label: "moonshot-v1-32k" },
      { id: "moonshot-v1-8k", label: "moonshot-v1-8k" },
    ],
    note: "型号以控制台为准，拉一下列表最快",
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: [
      { id: "gpt-4.1", label: "gpt-4.1" },
      { id: "gpt-4.1-mini", label: "gpt-4.1-mini" },
      { id: "o4-mini", label: "o4-mini" },
    ],
  },
  {
    id: "custom",
    label: "自定义",
    baseUrl: "",
    models: [],
    note: "填任何兼容 /chat/completions 的地址",
  },
];

export const providerOf = (baseUrl: string) =>
  PROVIDERS.find((p) => p.baseUrl && p.baseUrl === baseUrl) ?? PROVIDERS[3];
