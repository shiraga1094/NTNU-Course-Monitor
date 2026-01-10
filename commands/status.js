import { fetchOneCourse } from "../fetchOneCourse.js";
import { updateTmp } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply();

  const serialNo = interaction.options.getString("serial_no");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

  const course = await fetchOneCourse({ serialNo, year, term });
  if (!course || !course.raw) {
    await interaction.editReply("not found");
    return;
  }

  const key = `${serialNo}-${year}-${term}`;
  updateTmp(key, course.raw);

  // raw JSON printf（只印 terminal）
  console.dir(course.raw, { depth: null });

  const X = Number(course.raw.counter_exceptAuth);
  const Y = Number(course.raw.authorize_using);

  const normalCount = -Y;
  const normalLimit = Number(course.raw.limit_count_h);

  const authCount = X + Y;
  const authLimit = Number(course.raw.authorize_p);

  const totalCount = X;

  const reply = `
${course.name}
教師：${course.teacher}

一般選課：${normalCount} / ${normalLimit}
授權碼：${authCount} / ${authLimit}

選課總人數：${totalCount}
`.trim();

  await interaction.editReply(reply);
}
