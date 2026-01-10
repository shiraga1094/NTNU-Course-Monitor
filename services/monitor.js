import { fetchOneCourse } from "./fetchOneCourse.js";
import { loadSubs, saveSubs, updateTmp } from "../utils/storage.js";
import { logInfo, logError, logDebug } from "../utils/logger.js";
import { botStats } from "../utils/stats.js";
import { config } from "../config.js";

async function monitorLoop(client) {
  const subs = loadSubs();
  const courseMap = {};

  for (const uid of Object.keys(subs)) {
    for (const [key, entry] of Object.entries(subs[uid])) {
      if (entry.lastFull === undefined) continue;
      
      if (!courseMap[key]) {
        courseMap[key] = {
          serialNo: entry.serialNo,
          year: entry.year,
          term: entry.term,
          users: []
        };
      }
      courseMap[key].users.push(uid);
    }
  }

  if (Object.keys(courseMap).length === 0) {
    logDebug("沒有需要監控的課程");
    return;
  }

  logInfo(`開始監控 ${Object.keys(courseMap).length} 個課程...`);

  for (const [key, c] of Object.entries(courseMap)) {
    try {
      const course = await fetchOneCourse({
        serialNo: c.serialNo,
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

      for (const uid of c.users) {
        const entry = subs[uid][key];
        if (!entry || entry.lastFull === undefined) continue;

        const notifyMode = entry.notifyMode || "both";
        const shouldNotify = (lastFull, isFullNow, mode) => {
          if (lastFull === isFullNow) return false;
          if (mode === "available") return lastFull && !isFullNow;
          if (mode === "full") return !lastFull && isFullNow;
          return true;
        };

        if (shouldNotify(entry.lastFull, isFullNow, notifyMode)) {
          try {
            const statusChange = entry.lastFull ? "滿人 → 未滿 🟢" : "未滿 → 滿人 🔴";
            const message = 
              `**課程狀態變更通知**\n\n` +
              `課程：${course.name}\n` +
              `狀態變更：${statusChange}\n` +
              `選課人數：${normalCount} / ${normalLimit}\n` +
              `開課序號：${key}`;

            if (entry.channelId) {
              try {
                const channel = await client.channels.fetch(entry.channelId);
                await channel.send(`<@${uid}> ${message}`);
                logInfo(`通知已發送到頻道 ${entry.channelId} - 課程 ${key}`);
              } catch (err) {
                logError(`發送頻道通知失敗: ${err.message}`);
                const user = await client.users.fetch(uid);
                await user.send(message + `\n\n⚠️ 無法發送到指定頻道，改以私訊發送`);
              }
            } else {
              const user = await client.users.fetch(uid);
              await user.send(message);
              logInfo(`通知用戶 ${uid} 課程 ${key} 狀態變更：${statusChange}`);
            }

            entry.lastFull = isFullNow;
            botStats.incrementNotifications();
          } catch (err) {
            logError(`發送通知失敗: ${err.message}`);
            botStats.incrementErrors();
          }
        }
      }

      await new Promise(r => setTimeout(r, config.monitor.perFetchDelay));
      
    } catch (err) {
      logError(`監控錯誤: ${err.message}`);
    }
  }

  saveSubs(subs);
  botStats.incrementMonitorLoops();
  logInfo("監控循環完成");
}

export function startMonitorSchedule(client) {
  logInfo(`監控排程已啟動，檢查間隔：${config.monitor.checkInterval / 1000} 秒`);
  monitorLoop(client);
  setInterval(() => monitorLoop(client), config.monitor.checkInterval);
}
