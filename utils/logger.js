import fs from "fs";
import { config } from "../config.js";

const LOG_DIR = config.paths.logDir;
const LOG_FILE = config.paths.log;

// 確保 log 目錄存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ANSI 顏色代碼
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m"
};

// 日誌級別配置
const levels = {
  DEBUG: { name: "DEBUG", color: colors.gray, priority: 0 },
  INFO: { name: "INFO ", color: colors.blue, priority: 1 },
  WARN: { name: "WARN ", color: colors.yellow, priority: 2 },
  ERROR: { name: "ERROR", color: colors.red, priority: 3 },
  SUCCESS: { name: "SUCCESS", color: colors.green, priority: 1 }
};

const currentLogLevel = process.env.LOG_LEVEL?.toUpperCase() || "INFO";
const minPriority = levels[currentLogLevel]?.priority ?? 1;

function nowString() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())} ` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}:` +
    `${pad(d.getSeconds())}`
  );
}

function log(level, message) {
  const levelConfig = levels[level] || levels.INFO;
  
  // 過濾低於設定級別的日誌
  if (levelConfig.priority < minPriority) return;

  const timestamp = nowString();
  const logMessage = `[${timestamp}] [${levelConfig.name}] ${message}`;
  
  // 控制台輸出（帶顏色）
  const coloredMessage = `${colors.gray}[${timestamp}]${colors.reset} ${levelConfig.color}[${levelConfig.name}]${colors.reset} ${message}`;
  console.log(coloredMessage);
  
  // 檔案輸出（不帶顏色）
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

export function logDebug(message) {
  log("DEBUG", message);
}

export function logInfo(message) {
  log("INFO", message);
}

export function logWarn(message) {
  log("WARN", message);
}

export function logError(message) {
  log("ERROR", message);
}

export function logSuccess(message) {
  log("SUCCESS", message);
}

// 向後兼容的舊函數
export function logLine(line) {
  logInfo(line);
}

export function logCommand(interaction) {
  const args = {};
  for (const opt of interaction.options.data) {
    args[opt.name] = opt.value;
  }

  logInfo(
    `user=${interaction.user.username}(${interaction.user.id}) ` +
    `cmd=/${interaction.commandName} ` +
    `args=${JSON.stringify(args)}`
  );
}
