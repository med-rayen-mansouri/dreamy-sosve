import { config } from "dotenv";
import { spawnSync } from "node:child_process";
config({ path: ".env.local" });
const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
