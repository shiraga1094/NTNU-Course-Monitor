import { fetchOneCourse } from "../services/fetchOneCourse.js";
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

  const normalCount = X;  // 一般選課人數 = counter_exceptAuth
  const normalLimit = Number(course.raw.limit_count_h);

  const authUsed = Y <= 0 ? 0 : Y;  // 授權碼使用數，<= 0 時為 0
  const authCount = authUsed;
  const authLimit = Number(course.raw.authorize_p);

  const totalCount = Number(course.raw.counter);  // 選課總人數 = counter

  const reply = `
${course.name}
教師：${course.teacher}

一般選課：${normalCount} / ${normalLimit}
授權碼：${authCount} / ${authLimit}

選課總人數：${totalCount}
`.trim();

  await interaction.editReply(reply);
}
