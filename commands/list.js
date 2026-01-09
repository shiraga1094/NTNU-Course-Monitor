import { loadSubs } from "../utils/storage.js";

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
      const interval = data.scheduledReport.intervalMinutes;
      const channelInfo = data.scheduledReport.channelId ? ` (頻道)` : ` (私訊)`;
      status.push(`⏰ 定時報告 (${interval}分)${channelInfo}`);
    }
    
    lines.push(`**${key}**\n${status.join('\n')}`);
  }

  await interaction.editReply(
    `**📋 你的訂閱列表**\n\n${lines.join('\n\n')}\n\n` +
    `使用 \`/untrack\` 取消狀態監控\n` +
    `使用 \`/unschedule\` 取消定時報告`
  );
}
