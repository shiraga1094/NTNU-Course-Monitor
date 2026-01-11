import { fetchOneCourse } from "../services/fetchOneCourse.js";
import { loadSubs, saveSubs } from "../utils/storage.js";
import { logInfo } from "../utils/logger.js";

const DAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"];

function parseDays(daysStr) {
  if (!daysStr) return null;
  
  const trimmed = daysStr.trim();
  const rangeMatch = trimmed.match(/^(\d)-(\d)$/);
  
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    if (start < 0 || start > 6 || end < 0 || end > 6 || start > end) return null;
    
    const days = [];
    for (let i = start; i <= end; i++) days.push(i);
    return days;
  }
  
  const parts = trimmed.split(',').map(p => p.trim());
  const days = [];
  
  for (const part of parts) {
    const day = parseInt(part);
    if (isNaN(day) || day < 0 || day > 6) return null;
    if (!days.includes(day)) days.push(day);
  }
  
  return days.length > 0 ? days.sort((a, b) => a - b) : null;
}

function formatDays(weekdays) {
  return weekdays.map(d => `週${DAY_NAMES_ZH[d]}`).join("、");
}

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const serialNo = interaction.options.getString("serial_no");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");
  const mode = interaction.options.getString("mode");
  const interval = interaction.options.getInteger("interval");
  const days = interaction.options.getString("days");
  const hour = interaction.options.getInteger("hour");
  const minute = interaction.options.getInteger("minute");
  const channelId = interaction.options.getString("channel_id");

  const key = `${serialNo}-${year}-${term}`;
  const uid = interaction.user.id;

  if (mode === "interval") {
    if (!interval) {
      await interaction.editReply(
        "❌ 間隔模式需要設定 interval 參數\n\n" +
        "請重新執行指令並填寫：\n" +
        "• interval：報告間隔分鐘數（5-1440）"
      );
      return;
    }
    if (days || hour !== null || minute !== null) {
      await interaction.editReply(
        "⚠️ 間隔模式不需要 days、hour、minute 參數\n\n" +
        "您選擇了間隔模式，只需填寫 interval 參數即可。"
      );
      return;
    }
  } else if (mode === "cron") {
    if (interval) {
      await interaction.editReply(
        "⚠️ 固定時刻模式不需要 interval 參數\n\n" +
        "您選擇了固定時刻模式，請填寫 days、hour、minute 參數。"
      );
      return;
    }
    if (!days) {
      await interaction.editReply(
        "❌ 固定時刻模式需要輸入 days 參數\n\n" +
        "請重新執行指令並填寫：\n" +
        "• days：星期幾報告，格式：1,3,5 或 0-6\n" +
        "  （0=日 1=一 2=二 3=三 4=四 5=五 6=六）\n" +
        "• hour：報告小時（0-23）\n" +
        "• minute：報告分鐘（0-59）"
      );
      return;
    }
    if (hour === null || minute === null) {
      await interaction.editReply(
        "❌ 固定時刻模式需要設定 hour 和 minute 參數\n\n" +
        "請重新執行指令並填寫：\n" +
        "• hour：報告小時（0-23）\n" +
        "• minute：報告分鐘（0-59）"
      );
      return;
    }
    
    const weekdays = parseDays(days);
    if (!weekdays) {
      await interaction.editReply(
        "❌ days 參數格式錯誤\n\n" +
        "正確格式：\n" +
        "• 多個星期：1,3,5（週一、週三、週五）\n" +
        "• 範圍：0-6（週日到週六，即每天）\n" +
        "• 範圍：1-5（週一到週五，即工作日）\n" +
        "• 單一星期：3（週三）\n\n" +
        "（0=日 1=一 2=二 3=三 4=四 5=五 6=六）"
      );
      return;
    }
    
    interaction.parsedWeekdays = weekdays;
  } else {
    await interaction.editReply("❌ 無效的模式，請選擇 interval 或 cron");
    return;
  }

  const course = await fetchOneCourse({ serialNo, year, term });
  if (!course || !course.raw) {
    await interaction.editReply("找不到該課程");
    return;
  }

  const subs = loadSubs();

  if (!subs[uid]) subs[uid] = {};
  
  if (!subs[uid][key]) {
    subs[uid][key] = {
      serialNo,
      year,
      term
    };
  }

  if (mode === "interval") {
    subs[uid][key].scheduledReport = {
      enabled: true,
      mode: "interval",
      intervalMinutes: interval,
      channelId: channelId || null,
      nextReportTime: Date.now()
    };
  } else if (mode === "cron") {
    subs[uid][key].scheduledReport = {
      enabled: true,
      mode: "cron",
      weekdays: interaction.parsedWeekdays,
      hour: hour,
      minute: minute,
      channelId: channelId || null,
      lastReportDate: null
    };
  }

  saveSubs(subs);

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
**開課序號：** ${key}

**選課狀況：**
• 一般選課：${normalCount} / ${normalLimit} ${status}
• 授權碼：${authCount} / ${authLimit}
• 選課總人數：${X}

**報告時間：** ${new Date().toLocaleString('zh-TW')}

_可使用 \`/unschedule\` 取消定時報告_
`.trim();

  const reportTarget = channelId ? `頻道 <#${channelId}>` : "私訊";

  try {
    if (channelId) {
      const channel = await interaction.client.channels.fetch(channelId);
      await channel.send(reportMessage);
    } else {
      const user = await interaction.client.users.fetch(uid);
      await user.send(reportMessage);
    }
    
    if (mode === "interval") {
      const latestSubs = loadSubs();
      const intervalMs = interval * 60 * 1000;
      latestSubs[uid][key].scheduledReport.nextReportTime = Date.now() + intervalMs;
      saveSubs(latestSubs);
    }
    
    let scheduleInfo;
    if (mode === "interval") {
      scheduleInfo = `每 ${interval} 分鐘`;
    } else if (mode === "cron") {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      scheduleInfo = `${formatDays(interaction.parsedWeekdays)} ${timeStr}`;
    }
    
    await interaction.editReply(
      `✅ 已設定定時報告並發送首次報告\n\n` +
      `課程：${course.name}\n` +
      `開課序號：${key}\n` +
      `報告排程：${scheduleInfo}\n` +
      `報告位置：${reportTarget}`
    );
  } catch (error) {
    let scheduleInfo;
    if (mode === "interval") {
      scheduleInfo = `每 ${interval} 分鐘`;
    } else if (mode === "cron") {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      scheduleInfo = `${formatDays(interaction.parsedWeekdays)} ${timeStr}`;
    }
    
    await interaction.editReply(
      `✅ 已設定定時報告\n\n` +
      `課程：${course.name}\n` +
      `開課序號：${key}\n` +
      `報告排程：${scheduleInfo}\n` +
      `報告位置：${reportTarget}\n\n` +
      `⚠️ 發送首次報告時出錯：${error.message}`
    );
  }

  logInfo(`用戶 ${uid} 設定課程 ${key} 定時報告，模式：${mode}`);
}
