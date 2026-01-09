import { fetchOneCourse } from "./fetchOneCourse.js";
import { loadSubs } from "./utils/storage.js";
import { logInfo, logError } from "./utils/logger.js";
import { botStats } from "./utils/stats.js";

/**
 * 定時報告系統 - 檢查並發送課程人數報告
 */
export async function scheduledReportLoop(client) {
  const subs = loadSubs();
  const now = Date.now();

  for (const uid of Object.keys(subs)) {
    for (const [key, entry] of Object.entries(subs[uid])) {
      const report = entry.scheduledReport;
      
      // 檢查是否啟用定時報告
      if (!report || !report.enabled) continue;

      const intervalMs = report.intervalMinutes * 60 * 1000;
      const lastReport = report.lastReportTime || 0;
      const timeSinceLastReport = now - lastReport;

      // 檢查是否到達報告時間
      if (timeSinceLastReport < intervalMs) continue;

      try {
        // 抓取課程資料
        const course = await fetchOneCourse({
          courseCode: entry.courseCode,
          year: entry.year,
          term: entry.term
        });

        if (!course || !course.raw) {
          logError(`定時報告：無法取得課程資料 ${key}`);
          continue;
        }

        const raw = course.raw;
        const Y = Number(raw.authorize_using);
        const normalCount = -Y;
        const normalLimit = Number(raw.limit_count_h);
        const X = Number(raw.counter_exceptAuth);
        const authCount = X + Y;
        const authLimit = Number(raw.authorize_p);

        const isFull = normalCount >= normalLimit;
        const status = isFull ? "🔴 已滿" : "🟢 有名額";

        const reportMessage = `
**⏰ 定時課程報告**

**課程：** ${course.name}
**教師：** ${course.teacher}
**課程代碼：** ${key}

**選課狀況：**
• 一般選課：${normalCount} / ${normalLimit} ${status}
• 授權碼：${authCount} / ${authLimit}
• 選課總人數：${X}

**報告時間：** ${new Date(now).toLocaleString('zh-TW')}
**下次報告：** ${new Date(now + intervalMs).toLocaleString('zh-TW')}

_可使用 \`/unschedule\` 取消定時報告_
`.trim();

        // 發送報告
        if (report.channelId) {
          // 發送到指定頻道
          try {
            const channel = await client.channels.fetch(report.channelId);
            await channel.send(reportMessage);
            logInfo(`定時報告已發送到頻道 ${report.channelId} - 課程 ${key}`);
          } catch (error) {
            logError(`發送頻道報告失敗 channel=${report.channelId} course=${key}: ${error.message}`);
            // 失敗時改發私訊
            const user = await client.users.fetch(uid);
            await user.send(reportMessage + `\n\n⚠️ 無法發送到指定頻道，改以私訊發送`);
          }
        } else {
          // 發送私訊
          const user = await client.users.fetch(uid);
          await user.send(reportMessage);
          logInfo(`定時報告已私訊給用戶 ${uid} - 課程 ${key}`);
        }

        // 更新最後報告時間
        entry.scheduledReport.lastReportTime = now;
        botStats.incrementNotifications();

      } catch (error) {
        logError(`定時報告錯誤 user=${uid} course=${key}: ${error.message}`);
      }
    }
  }

  // 儲存更新的報告時間
  const { default: fs } = await import("fs");
  const { config } = await import("./config.js");
  fs.writeFileSync(config.paths.subscriptions, JSON.stringify(subs, null, 2));
}

/**
 * 啟動定時報告排程
 */
export function startScheduledReports(client) {
  const CHECK_INTERVAL = 60 * 1000; // 每分鐘檢查一次

  logInfo(`定時報告系統已啟動，檢查間隔：${CHECK_INTERVAL / 1000} 秒`);

  // 設定定期執行
  setInterval(() => scheduledReportLoop(client), CHECK_INTERVAL);
}
