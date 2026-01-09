import { loadSubs } from "../utils/storage.js";
import { botStats } from "../utils/stats.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const subs = loadSubs();
  
  // 統計總用戶數和課程數
  const totalUsers = Object.keys(subs).length;
  let totalCourses = 0;
  const courseSet = new Set();
  
  for (const uid in subs) {
    const userCourses = Object.keys(subs[uid]);
    totalCourses += userCourses.length;
    userCourses.forEach(course => courseSet.add(course));
  }
  
  const uniqueCourses = courseSet.size;

  // 記憶體使用
  const memUsage = process.memoryUsage();
  const memUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
  const memTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

  const reply = `
**📊 Bot 運行狀態**

**基本資訊：**
• 運行時間：${botStats.getUptime()}
• Bot 版本：v1.0.0
• Node.js 版本：${process.version}

**使用統計：**
• 訂閱用戶數：${totalUsers} 人
• 訂閱總數：${totalCourses} 筆
• 監控課程數：${uniqueCourses} 門
• 已發送通知：${botStats.notificationsSent} 次
• 指令執行次數：${botStats.commandsExecuted} 次
• 監控循環完成：${botStats.monitorLoopsCompleted} 次

**系統資源：**
• 記憶體使用：${memUsedMB} MB / ${memTotalMB} MB
• 錯誤次數：${botStats.errors} 次
• 最後監控時間：${botStats.lastMonitorTime ? new Date(botStats.lastMonitorTime).toLocaleString('zh-TW') : '尚未執行'}

**狀態：** 🟢 正常運行
`.trim();

  await interaction.editReply(reply);
}
