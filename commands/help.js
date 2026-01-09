export async function execute(interaction) {
  const helpText = `
**📚 NTNU 課程監控 Bot 使用說明**

**基本指令：**
\`/ping\` - 測試 bot 是否正常運作
\`/help\` - 顯示此說明訊息

**課程查詢：**
\`/status <課程代碼> <學年> <學期>\`
查詢課程即時選課狀況
例如：\`/status AEU0049 114 1\`

\`/info <課程代碼> <學年> <學期>\`
顯示課程詳細資訊

**訂閱管理：**
\`/track <課程代碼> <學年> <學期>\`
訂閱課程人數變化，當課程從「滿人」變成「未滿」或反之時會收到通知

\`/untrack <課程代碼> <學年> <學期>\`
取消訂閱課程

\`/list\`
列出目前訂閱的所有課程

\`/notify <課程代碼> <學年> <學期> <模式>\`
設定通知偏好：
- \`both\` - 雙向通知（預設）
- \`available\` - 僅在有名額時通知
- \`full\` - 僅在滿人時通知

**參數說明：**
• 課程代碼：如 AEU0049
• 學年：如 114
• 學期：1（上學期）、2（下學期）、3（暑期）

**注意事項：**
• Bot 每 60 秒檢查一次課程狀態
• 通知會以私訊方式發送
• 所有訂閱資料僅供個人使用
`.trim();

  await interaction.reply({ content: helpText, ephemeral: true });
}
