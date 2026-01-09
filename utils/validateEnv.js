import { config } from "../config.js";

const requiredEnvVars = [
  { key: "DISCORD_TOKEN", value: config.discord.token },
  { key: "DISCORD_CLIENT_ID", value: config.discord.clientId },
  { key: "DISCORD_GUILD_ID", value: config.discord.guildId }
];

export function validateEnv() {
  const missing = [];

  for (const { key, value } of requiredEnvVars) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `缺少必要的環境變數：${missing.join(", ")}\n` +
      `請在 .env 檔案中設定這些變數，或參考 .env.example`
    );
  }
}
