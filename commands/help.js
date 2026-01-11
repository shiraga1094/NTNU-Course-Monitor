export async function execute(interaction) {
  const helpText = `
**📚 NTNU 課程監控 Bot 使用說明**

**基本指令：**
\`/ping\` - 測試 bot 是否正常運作
\`/help\` - 顯示此說明訊息
\`/botstats\` - 顯示 Bot 運行統計資訊

**課程查詢：**
\`/status <serial_no> <year> <term>\`
查詢課程即時選課狀況
例如：\`/status 1001 114 1\`

\`/info <serial_no> <year> <term>\`
顯示課程詳細資訊

**訂閱管理：**
\`/track <serial_no> <year> <term> [channel]\`
訂閱課程人數變化，當課程從「滿人」變成「未滿」或反之時會收到通知
• channel：選填，不填則發送私訊

\`/untrack <serial_no> <year> <term>\`
取消訂閱課程

\`/list\`
列出目前訂閱的所有課程

\`/notify <serial_no> <year> <term> <mode>\`
設定通知偏好：
• \`both\` - 雙向通知（預設）
• \`available\` - 僅在有名額時通知
• \`full\` - 僅在滿人時通知

**定時報告：**
\`/schedule <serial_no> <year> <term> <mode> ...\`
設定定時自動回傳選課人數，支援兩種模式：

**間隔模式**（每 N 分鐘報告一次）：
• mode：選擇 \`interval\`
• interval：報告間隔（分鐘），5-1440 分鐘
• channel_id：選填，不填則私訊
例如：每 30 分鐘報告一次

**固定時刻模式**（指定星期幾的特定時間）：
• mode：選擇 \`cron\`
• days：星期幾報告，格式：\`1,3,5\` 或 \`0-6\`
  （0=日 1=一 2=二 3=三 4=四 5=五 6=六）
• hour：報告小時（0-23）
• minute：報告分鐘（0-59）
• channel_id：選填，不填則私訊
例如：每週一、三、五的 14:30 報告

\`/unschedule <serial_no> <year> <term>\`
取消定時報告

**參數說明：**
• serial_no：開課序號，例如 1001（官方選課系統的開課序號）
• year：學年度，例如 114
• term：學期代碼
  - 1：上學期（秋季）
  - 2：下學期（春季）
  - 3：暑期
• channel：Discord 頻道 ID（右鍵頻道 → 複製頻道 ID）

**運作機制：**
• Bot 每 60 秒自動檢查一次所有被追蹤的課程
• 當課程人數狀態改變時，會立即發送通知
• 定時報告會按照設定的間隔定期發送課程資訊
• 所有訂閱資料都與使用者 ID 綁定

**隱私與資料：**
• 所有訂閱資料僅供個人使用，不會分享給其他使用者
• 可隨時使用 \`/list\` 查看自己的訂閱清單
• 可隨時使用 \`/untrack\` 或 \`/unschedule\` 取消訂閱
`.trim();

  await interaction.reply({ content: helpText, ephemeral: true });
}
