import fs from "fs";
import { config } from "../config.js";
import { logInfo, logDebug } from "./logger.js";

/**
 * 清理過期的暫存資料
 */
export function cleanupOldTmpData() {
  const tmpFile = config.paths.tmp;
  
  if (!fs.existsSync(tmpFile)) {
    logDebug("暫存檔案不存在，跳過清理");
    return;
  }

  const tmp = JSON.parse(fs.readFileSync(tmpFile, "utf8"));
  const now = Date.now();
  const maxAge = config.cleanup.tmpDataAge * 24 * 60 * 60 * 1000; // 轉換為毫秒
  
  let removed = 0;
  
  for (const [key, data] of Object.entries(tmp)) {
    if (!data.lastFetchAt) continue;
    
    const fetchTime = new Date(data.lastFetchAt).getTime();
    const age = now - fetchTime;
    
    if (age > maxAge) {
      delete tmp[key];
      removed++;
    }
  }
  
  if (removed > 0) {
    fs.writeFileSync(tmpFile, JSON.stringify(tmp, null, 2));
    logInfo(`清理完成：移除 ${removed} 筆過期的暫存資料`);
  } else {
    logDebug("沒有需要清理的暫存資料");
  }
}

/**
 * 清理空的訂閱用戶
 */
export function cleanupEmptySubscriptions() {
  const subFile = config.paths.subscriptions;
  
  if (!fs.existsSync(subFile)) {
    logDebug("訂閱檔案不存在，跳過清理");
    return;
  }

  const subs = JSON.parse(fs.readFileSync(subFile, "utf8"));
  let removed = 0;
  
  for (const [uid, courses] of Object.entries(subs)) {
    if (!courses || Object.keys(courses).length === 0) {
      delete subs[uid];
      removed++;
    }
  }
  
  if (removed > 0) {
    fs.writeFileSync(subFile, JSON.stringify(subs, null, 2));
    logInfo(`清理完成：移除 ${removed} 個空的訂閱用戶`);
  } else {
    logDebug("沒有需要清理的訂閱用戶");
  }
}

/**
 * 執行所有清理任務
 */
export function runCleanup() {
  logInfo("開始執行資料清理...");
  cleanupOldTmpData();
  cleanupEmptySubscriptions();
  logInfo("資料清理完成");
}

/**
 * 啟動定期清理任務
 */
export function startCleanupSchedule() {
  const interval = config.cleanup.cleanupInterval * 60 * 60 * 1000; // 轉換為毫秒
  
  logInfo(`定期清理任務已啟動，間隔：${config.cleanup.cleanupInterval} 小時`);
  
  // 立即執行一次
  runCleanup();
  
  // 設定定期執行
  setInterval(runCleanup, interval);
}
