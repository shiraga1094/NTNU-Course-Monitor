import { fetchOneCourse } from "../fetchOneCourse.js";
import { loadSubs, saveSubs, updateTmp } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const courseCode = interaction.options.getString("course_code");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");
  const channelId = interaction.options.getString("channel_id");

  const course = await fetchOneCourse({ courseCode, year, term });
  if (!course || !course.raw) {
    await interaction.editReply("not found");
    return;
  }

  const key = `${courseCode}-${year}-${term}`;
  updateTmp(key, course.raw);

  const Y = Number(course.raw.authorize_using);
  const normalCount = -Y;
  const normalLimit = Number(course.raw.limit_count_h);
  const isFull = normalCount >= normalLimit;

  const uid = interaction.user.id;
  const subs = loadSubs();
  if (!subs[uid]) subs[uid] = {};
  subs[uid][key] = {
    courseCode,
    year,
    term,
    lastFull: isFull,
    channelId: channelId || null
  };

  saveSubs(subs);

  const notifyTarget = channelId 
    ? `頻道 <#${channelId}>` 
    : "私訊";

  await interaction.editReply(
    `✅ 已訂閱課程 ${key}\n\n` +
    `初始狀態：${isFull ? "🔴 滿人" : "🟢 未滿"}\n` +
    `通知方式：${notifyTarget}\n\n` +
    `當課程人數變化時將收到通知`
  );
}
