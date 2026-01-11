import { fetchOneCourse } from "./fetchOneCourse.js";
import { loadSubs } from "../utils/storage.js";
import { logInfo, logError } from "../utils/logger.js";
import { botStats } from "../utils/stats.js";
import { config } from "../config.js";
import fs from "fs";

function getCurrentDateTime() {
  const now = new Date();
  const timeZone = config.logging?.timezone || "Asia/Taipei";
  
  const dateStr = now.toLocaleString("zh-TW", { 
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  
  const dateInZone = new Date(now.toLocaleString("en-US", { timeZone }));
  const [datePart, timePart] = dateStr.split(" ");
  const [year, month, day] = datePart.split("/");
  const [hour, minute] = timePart.split(":");
  
  return {
    weekday: dateInZone.getDay(),
    hour: parseInt(hour),
    minute: parseInt(minute),
    dateString: `${year}-${month}-${day}`,
    timestamp: now.getTime()
  };
}

function shouldSendCronReport(report, currentDateTime) {
  return report.weekdays.includes(currentDateTime.weekday) &&
         report.hour === currentDateTime.hour &&
         report.minute === currentDateTime.minute &&
         report.lastReportDate !== currentDateTime.dateString;
}

async function scheduledReportLoop(client) {
  const subs = loadSubs();
  const currentDateTime = getCurrentDateTime();
  const now = currentDateTime.timestamp;
  const updates = {};

  for (const uid of Object.keys(subs)) {
    for (const [key, entry] of Object.entries(subs[uid])) {
      const report = entry.scheduledReport;
      if (!report || !report.enabled) continue;

      let shouldSend = false;

      if (report.mode === "interval" || !report.mode) {
        shouldSend = now >= (report.nextReportTime || 0);
      } else if (report.mode === "cron") {
        shouldSend = shouldSendCronReport(report, currentDateTime);
      }

      if (!shouldSend) continue;

      try {
        const course = await fetchOneCourse({
          serialNo: entry.serialNo,
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

        const message = `
**⏰ 定時課程報告**

**課程：** ${course.name}
**教師：** ${course.teacher}
**開課序號：** ${key}

**選課狀況：**
• 一般選課：${normalCount} / ${normalLimit} ${status}
• 授權碼：${authCount} / ${authLimit}
• 選課總人數：${X}

**報告時間：** ${new Date(now).toLocaleString('zh-TW')}

_可使用 \`/unschedule\` 取消定時報告_
`.trim();

        if (report.channelId) {
          try {
            const channel = await client.channels.fetch(report.channelId);
            await channel.send(message);
            logInfo(`定時報告已發送到頻道 ${report.channelId} - 課程 ${key}`);
          } catch (err) {
            logError(`發送頻道報告失敗: ${err.message}`);
            const user = await client.users.fetch(uid);
            await user.send(message + `\n\n⚠️ 無法發送到指定頻道，改以私訊發送`);
          }
        } else {
          const user = await client.users.fetch(uid);
          await user.send(message);
          logInfo(`定時報告已私訊給用戶 ${uid} - 課程 ${key}`);
        }

        if (!updates[uid]) updates[uid] = {};
        if (report.mode === "interval" || !report.mode) {
          const intervalMs = report.intervalMinutes * 60 * 1000;
          updates[uid][key] = { nextReportTime: now + intervalMs };
        } else if (report.mode === "cron") {
          updates[uid][key] = { lastReportDate: currentDateTime.dateString };
        }
        
        botStats.incrementNotifications();
      } catch (err) {
        logError(`定時報告錯誤: ${err.message}`);
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    const latestSubs = loadSubs();
    for (const uid of Object.keys(updates)) {
      for (const key of Object.keys(updates[uid])) {
        if (latestSubs[uid]?.[key]?.scheduledReport) {
          Object.assign(latestSubs[uid][key].scheduledReport, updates[uid][key]);
        }
      }
    }
    fs.writeFileSync(config.paths.subscriptions, JSON.stringify(latestSubs, null, 2));
  }
}

export function startScheduledReports(client) {
  const CHECK_INTERVAL = 60 * 1000;
  logInfo(`定時報告系統已啟動，檢查間隔：${CHECK_INTERVAL / 1000} 秒`);
  setInterval(() => scheduledReportLoop(client), CHECK_INTERVAL);
}
