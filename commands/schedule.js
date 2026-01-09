import { fetchOneCourse } from "../fetchOneCourse.js";
import { loadSubs, saveSubs } from "../utils/storage.js";
import { logInfo } from "../utils/logger.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const courseCode = interaction.options.getString("course_code");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");
  const interval = interaction.options.getInteger("interval") || 60;
  const channelId = interaction.options.getString("channel_id");

  const key = `${courseCode}-${year}-${term}`;
  const uid = interaction.user.id;

  const course = await fetchOneCourse({ courseCode, year, term });
  if (!course || !course.raw) {
    await interaction.editReply("找不到該課程");
    return;
  }

  const subs = loadSubs();

  if (!subs[uid]) subs[uid] = {};
  
  if (!subs[uid][key]) {
    subs[uid][key] = {
      courseCode,
      year,
      term
    };
  }

  subs[uid][key].scheduledReport = {
    enabled: true,
    intervalMinutes: interval,
    channelId: channelId || null,
    lastReportTime: Date.now()
  };

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
**課程代碼：** ${key}

**選課狀況：**
• 一般選課：${normalCount} / ${normalLimit} ${status}
• 授權碼：${authCount} / ${authLimit}
• 選課總人數：${X}

**報告時間：** ${new Date().toLocaleString('zh-TW')}
**下次報告：** ${new Date(Date.now() + interval * 60000).toLocaleString('zh-TW')}

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
    
    await interaction.editReply(
      `✅ 已設定定時報告並發送首次報告\n\n` +
      `課程：${course.name}\n` +
      `課程代碼：${key}\n` +
      `報告間隔：每 ${interval} 分鐘\n` +
      `報告位置：${reportTarget}`
    );
  } catch (error) {
    await interaction.editReply(
      `✅ 已設定定時報告\n\n` +
      `課程：${course.name}\n` +
      `課程代碼：${key}\n` +
      `報告間隔：每 ${interval} 分鐘\n` +
      `報告位置：${reportTarget}\n\n` +
      `⚠️ 發送首次報告時出錯：${error.message}`
    );
  }

  logInfo(`用戶 ${uid} 設定課程 ${key} 定時報告，間隔 ${interval} 分鐘`);
}
