import { fetchOneCourse } from "../fetchOneCourse.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const courseCode = interaction.options.getString("course_code");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

  const course = await fetchOneCourse({ courseCode, year, term });
  if (!course || !course.raw) {
    await interaction.editReply("找不到該課程資訊");
    return;
  }

  const raw = course.raw;
  const X = Number(raw.counter_exceptAuth);
  const Y = Number(raw.authorize_using);

  const normalCount = -Y;
  const normalLimit = Number(raw.limit_count_h);
  const authCount = X + Y;
  const authLimit = Number(raw.authorize_p);
  const totalCount = X;

  const reply = `
**📖 課程詳細資訊**

**課程名稱：** ${course.name}
**課程代碼：** ${raw.course_code || courseCode}
**教師：** ${course.teacher}
**學年/學期：** ${year} 學年 第 ${term} 學期

**選課人數：**
一般選課：${normalCount} / ${normalLimit} ${normalCount >= normalLimit ? '🔴 已滿' : '🟢 有名額'}
授權碼：${authCount} / ${authLimit}
選課總人數：${totalCount}

**課程時間：** ${raw.time_chn || '未提供'}
**教室：** ${raw.place || '未提供'}
**學分：** ${raw.credits || '未提供'}

**備註：** ${raw.note || '無'}
`.trim();

  await interaction.editReply(reply);
}
