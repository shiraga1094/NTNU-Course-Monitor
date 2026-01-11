import { loadSubs } from "../utils/storage.js";

const DAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"];

function formatDays(weekdays) {
  return weekdays.map(d => `週${DAY_NAMES_ZH[d]}`).join("、");
}

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const uid = interaction.user.id;
  const subs = loadSubs();
  const mine = subs[uid];

  if (!mine || Object.keys(mine).length === 0) {
    await interaction.editReply("你目前沒有任何訂閱或設定");
    return;
  }

  const lines = [];
  
  for (const [key, data] of Object.entries(mine)) {
    const hasTrack = data.lastFull !== undefined;
    const hasSchedule = data.scheduledReport?.enabled;
    
    let status = [];
    if (hasTrack) {
      const channelInfo = data.channelId ? ` (頻道)` : ` (私訊)`;
      status.push(`🔔 狀態監控${channelInfo}`);
    }
    if (hasSchedule) {
      const scheduleData = data.scheduledReport;
      const channelInfo = scheduleData.channelId ? ` (頻道)` : ` (私訊)`;
      
      let scheduleInfo;
      if (scheduleData.mode === "interval") {
        scheduleInfo = `每 ${scheduleData.intervalMinutes} 分鐘`;
      } else if (scheduleData.mode === "cron") {
        const timeStr = `${String(scheduleData.hour).padStart(2, '0')}:${String(scheduleData.minute).padStart(2, '0')}`;
        scheduleInfo = `${formatDays(scheduleData.weekdays)} ${timeStr}`;
      } else {
        scheduleInfo = "未知模式";
      }
      
      status.push(`⏰ 定時報告: ${scheduleInfo}${channelInfo}`);
    }
    
    lines.push(`**${key}**\n${status.join('\n')}`);
  }

  await interaction.editReply(
    `**📋 你的訂閱列表**\n\n${lines.join('\n\n')}\n\n` +
    `使用 \`/untrack\` 取消狀態監控\n` +
    `使用 \`/unschedule\` 取消定時報告`
  );
}
