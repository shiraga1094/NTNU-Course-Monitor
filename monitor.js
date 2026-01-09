import { fetchOneCourse } from "./fetchOneCourse.js";
import { loadSubs, saveSubs, updateTmp } from "./utils/storage.js";
import { logInfo, logError, logDebug } from "./utils/logger.js";
import { config } from "./config.js";

/**
 * 監控循環 - 檢查所有訂閱的課程
 */
export async function monitorLoop(client) {
  const subs = loadSubs();
  const courseMap = {};

  // 收集所有需要監控的課程
  for (const uid of Object.keys(subs)) {
    for (const key of Object.keys(subs[uid])) {
      courseMap[key] = subs[uid][key];
    }
  }

  if (Object.keys(courseMap).length === 0) {
    logDebug("沒有需要監控的課程");
    return;
  }

  logInfo(`開始監控 ${Object.keys(courseMap).length} 個課程...`);

  // 檢查每個課程
  for (const [key, c] of Object.entries(courseMap)) {
    try {
      const course = await fetchOneCourse({
        courseCode: c.courseCode,
        year: c.year,
        term: c.term
      });
      
      if (!course || !course.raw) {
        logError(`無法取得課程資料：${key}`);
        continue;
      }

      updateTmp(key, course.raw);

      const Y = Number(course.raw.authorize_using);
      const normalCount = -Y;
      const normalLimit = Number(course.raw.limit_count_h);
      const isFullNow = normalCount >= normalLimit;

      // 通知所有訂閱此課程的用戶
      for (const uid of Object.keys(subs)) {
        const entry = subs[uid][key];
        if (!entry) continue;

        const notifyMode = entry.notifyMode || "both";
        const shouldNotify = shouldSendNotification(
          entry.lastFull,
          isFullNow,
          notifyMode
        );

        if (shouldNotify) {
          try {
            const user = await client.users.fetch(uid);
            const statusChange = entry.lastFull ? "滿人 → 未滿 🟢" : "未滿 → 滿人 🔴";
            
            await user.send(
              `**課程狀態變更通知**\n\n` +
              `課程：${course.name}\n` +
              `狀態變更：${statusChange}\n` +
              `選課人數：${normalCount} / ${normalLimit}\n` +
              `課程代碼：${key}`
            );

            entry.lastFull = isFullNow;
            logInfo(`通知用戶 ${uid} 課程 ${key} 狀態變更：${statusChange}`);
          } catch (error) {
            logError(`發送通知失敗 user=${uid} course=${key}: ${error.message}`);
          }
        }
      }

      // 延遲避免請求過於頻繁
      await new Promise(r => setTimeout(r, config.monitor.perFetchDelay));
      
    } catch (err) {
      logError(`監控錯誤 course=${key}: ${err.message}`);
    }
  }

  saveSubs(subs);
  logInfo("監控循環完成");
}

/**
 * 判斷是否應該發送通知
 */
function shouldSendNotification(lastFull, isFullNow, notifyMode) {
  if (lastFull === isFullNow) {
    return false; // 狀態沒變化
  }

  switch (notifyMode) {
    case "available":
      // 僅在變成有名額時通知（滿 → 未滿）
      return lastFull === true && isFullNow === false;
    
    case "full":
      // 僅在變成滿人時通知（未滿 → 滿）
      return lastFull === false && isFullNow === true;
    
    case "both":
    default:
      // 任何變化都通知
      return true;
  }
}

/**
 * 啟動監控排程
 */
export function startMonitorSchedule(client) {
  const interval = config.monitor.checkInterval;
  
  logInfo(`監控排程已啟動，檢查間隔：${interval / 1000} 秒`);
  
  // 立即執行一次
  monitorLoop(client);
  
  // 設定定期執行
  setInterval(() => monitorLoop(client), interval);
}
