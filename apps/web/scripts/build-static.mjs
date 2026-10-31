/**
 * 静态导出版：先把 app/api 挪走（export 模式不允许 route handler），
 * 构建完再挪回来，别让人手工记得恢复。
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "app", "api");
const stash = path.join(root, ".api-stash");

const candidates = [
  path.join(root, "node_modules", "next", "dist", "bin", "next"),
  path.join(root, "..", "..", "node_modules", "next", "dist", "bin", "next"),
];
const nextBin = candidates.find((p) => fs.existsSync(p));
if (!nextBin) {
  console.error("找不到 next，先在仓库根目录 pnpm install");
  process.exit(1);
}

const moved = fs.existsSync(apiDir);
if (moved) fs.renameSync(apiDir, stash);

try {
  execFileSync(process.execPath, [nextBin, "build"], {
    stdio: "inherit",
    env: { ...process.env, NEXT_STATIC: "1" },
  });
} finally {
  if (moved) fs.renameSync(stash, apiDir);
}

console.log("静态产物在 out/，可以直接丢到 GitHub Pages");
