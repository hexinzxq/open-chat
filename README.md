# Open Chat

一个能直接聊天的开源界面：左侧会话、中间消息流、流式输出、Markdown 渲染。前端 Next.js，
后端可选——默认走 Next 自己的 Route Handler 代理，纯静态托管时自动直连上游。

在线试用：<https://hexinzxq.github.io/open-chat/>

## 它长什么样

- 三栏：会话列表 / 消息流 / 输入框，键盘可达，深色单色底 + 一个品牌蓝
- 流式回复，可以中途停止，失败能原地重试
- 会话和历史存在浏览器（localStorage），换设备不同步，也不上传
- 接口兼容任何 OpenAI 协议端点：DeepSeek、OpenAI、自建网关都行，改 Base URL 即可

## 跑起来（Mac / Windows 通用）

需要 Node.js 24+ 和 pnpm 10+。

```bash
git clone https://github.com/hexinzxq/open-chat.git
cd open-chat
pnpm install
pnpm dev
```

打开 <http://localhost:3000>，点左下角「设置」，填 API Key（Base URL 默认 `https://api.deepseek.com`，
模型默认 `deepseek-chat`）。Key 只存在你本地浏览器里。

Windows 上用 PowerShell 或 Git Bash 跑同样的命令；没有 pnpm 就先 `npm i -g pnpm@10`。

## 两种构建

| 模式 | 命令 | 说明 |
|---|---|---|
| 本地开发 | `pnpm dev` | Next dev server，带 `/api/chat` 代理 |
| 静态导出 | `pnpm build:static` | 产物在 `apps/web/out/`，无服务端，前端直连上游 |
| 生产（Node） | `pnpm build && pnpm --filter @open-chat/web start` | standalone 服务端渲染 |

静态版没有 `/api/chat`，前端会检测到 404 然后改成浏览器直连；DeepSeek 的接口是允许跨域的，
换成别家接口时如果被 CORS 挡了，就用带服务端的部署方式。

## 部署

- **GitHub Pages**：仓库自带 `.github/workflows/pages.yml`，推到 main 自动构建静态版并发布到
  `/open-chat/` 子路径。
- **Vercel / 自建 Node**：直接连仓库，构建命令 `pnpm --filter @open-chat/web build`；
  想免去用户填 key，可以在环境变量里配 `DEEPSEEK_API_KEY`，代理会优先用它。

## 可选：完整后端

仓库里还留着阶段一搭好的 `apps/api`（FastAPI + PostgreSQL + Redis），用于后续做多用户、
持久化会话和 RAG。它不影响上面任何一条启动路径。

```bash
pnpm dev:full                     # 同时起 web 和 api
docker compose up -d postgres redis
```

## 目录

```
apps/web                 Next.js 前端 + /api/chat 代理
  app/page.tsx           聊天主界面
  components/chat/       侧栏、消息、输入框、设置
  lib/chat/             类型、状态（zustand + persist）、SSE 解析
  scripts/build-static   静态导出脚本（临时挪走 api 路由）
apps/api                 FastAPI（可选）
.github/workflows/pages 静态版自动部署
```

## License

MIT
