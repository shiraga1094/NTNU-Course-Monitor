import fs from "fs";
import path from "path";
import { config } from "../config.js";

const LOG_DIR = config.paths.logDir;

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

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
  const timezone = config.logging.timezone;
  const d = new Date();
  const localDate = new Date(d.toLocaleString("en-US", { timeZone: timezone }));
  const pad = n => String(n).padStart(2, "0");
  return (
    `${localDate.getFullYear()}-` +
    `${pad(localDate.getMonth() + 1)}-` +
    `${pad(localDate.getDate())} ` +
    `${pad(localDate.getHours())}:` +
    `${pad(localDate.getMinutes())}:` +
    `${pad(localDate.getSeconds())}`
  );
}

function getDateString() {
  const timezone = config.logging.timezone;
  const d = new Date();
  const localDate = new Date(d.toLocaleString("en-US", { timeZone: timezone }));
  const pad = n => String(n).padStart(2, "0");
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}`;
}

function getLogFile() {
  const dateStr = getDateString();
  return path.join(LOG_DIR, `bot-${dateStr}.log`);
}

function cleanupOldLogs() {
  try {
    const retentionDays = config.logging.logRetentionDays;
    const now = Date.now();
    const maxAge = retentionDays * 24 * 60 * 60 * 1000;
    
    const files = fs.readdirSync(LOG_DIR);
    let removedCount = 0;
    
    for (const file of files) {
      if (!file.startsWith("bot-") || !file.endsWith(".log")) continue;
      
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filePath);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`${colors.gray}已清理 ${removedCount} 個過期 log 文件${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}清理舊 log 失敗: ${error.message}${colors.reset}`);
  }
}

let lastCleanupDate = getDateString();

function log(level, message) {
  const levelConfig = levels[level] || levels.INFO;
  
  if (levelConfig.priority < minPriority) return;

  const currentDate = getDateString();
  if (currentDate !== lastCleanupDate) {
    cleanupOldLogs();
    lastCleanupDate = currentDate;
  }

  const timestamp = nowString();
  const logMessage = `[${timestamp}] [${levelConfig.name}] ${message}`;
  
  const coloredMessage = `${colors.gray}[${timestamp}]${colors.reset} ${levelConfig.color}[${levelConfig.name}]${colors.reset} ${message}`;
  console.log(coloredMessage);
  
  const logFile = getLogFile();
  fs.appendFileSync(logFile, logMessage + "\n");
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
