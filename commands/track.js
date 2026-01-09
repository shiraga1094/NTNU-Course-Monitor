import { fetchOneCourse } from "../fetchOneCourse.js";
import { loadSubs, saveSubs, updateTmp } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const courseCode = interaction.options.getString("course_code");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

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
    lastFull: isFull
  };

  saveSubs(subs);

  await interaction.editReply(
    `tracked ${key}\n初始狀態：${isFull ? "滿人" : "未滿"}`
  );
}
