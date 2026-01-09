import { loadSubs, saveSubs } from "../utils/storage.js";

const NOTIFY_MODES = {
  both: "雙向通知（滿人 ↔ 未滿）",
  available: "僅在有名額時通知（滿人 → 未滿）",
  full: "僅在滿人時通知（未滿 → 滿人）"
};

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const courseCode = interaction.options.getString("course_code");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");
  const mode = interaction.options.getString("mode") || "both";

  if (!NOTIFY_MODES[mode]) {
    await interaction.editReply(
      `無效的通知模式。可用模式：\n${Object.entries(NOTIFY_MODES)
        .map(([k, v]) => `• \`${k}\` - ${v}`)
        .join("\n")}`
    );
    return;
  }

  const key = `${courseCode}-${year}-${term}`;
  const uid = interaction.user.id;
  const subs = loadSubs();

  if (!subs[uid] || !subs[uid][key]) {
    await interaction.editReply(`你尚未訂閱此課程 (${key})\n請先使用 \`/track\` 訂閱課程`);
    return;
  }

  subs[uid][key].notifyMode = mode;
  saveSubs(subs);

  await interaction.editReply(
    `✅ 已更新課程 ${key} 的通知設定\n模式：${NOTIFY_MODES[mode]}`
  );
}
