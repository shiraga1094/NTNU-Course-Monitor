import { loadSubs, saveSubs } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const serialNo = interaction.options.getString("serial_no");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

  const key = `${serialNo}-${year}-${term}`;
  const uid = interaction.user.id;
  const subs = loadSubs();

  // 檢查是否有 track（有 lastFull 屬性）
  if (!subs[uid] || !subs[uid][key] || subs[uid][key].lastFull === undefined) {
    await interaction.editReply(`你尚未訂閱 ${key} 的狀態監控`);
    return;
  }

  // 刪除 track 相關屬性
  delete subs[uid][key].lastFull;
  delete subs[uid][key].notifyMode;
  delete subs[uid][key].channelId;
  
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
  await interaction.editReply(`✅ 已取消 ${key} 的狀態監控`);
}
