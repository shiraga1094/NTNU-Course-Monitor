import { loadSubs, saveSubs } from "../utils/storage.js";
import { logInfo } from "../utils/logger.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const serialNo = interaction.options.getString("serial_no");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

  const key = `${serialNo}-${year}-${term}`;
  const uid = interaction.user.id;
  const subs = loadSubs();

  // 檢查是否有 schedule
  if (!subs[uid] || !subs[uid][key] || !subs[uid][key].scheduledReport?.enabled) {
    await interaction.editReply(`課程 ${key} 尚未設定定時報告`);
    return;
  }

  // 刪除定時報告
  delete subs[uid][key].scheduledReport;

  // 如果沒有其他東西了，刪除整個課程
  const hasOtherData = Object.keys(subs[uid][key]).some(
    k => !['serialNo', 'year', 'term'].includes(k)
  );
  
  if (!hasOtherData) {
    delete subs[uid][key];
    
    // 如果用戶沒有任何訂閱了，刪除用戶
    if (Object.keys(subs[uid]).length === 0) {
      delete subs[uid];
    }
  }

  saveSubs(subs);
  await interaction.editReply(`✅ 已取消 ${key} 的定時報告`);
  logInfo(`用戶 ${uid} 取消課程 ${key} 定時報告`);
}
