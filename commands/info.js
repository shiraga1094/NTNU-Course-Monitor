import { fetchOneCourse } from "../fetchOneCourse.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const serialNo = interaction.options.getString("serial_no");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");

  const course = await fetchOneCourse({ serialNo, year, term });
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

  const timeInfo = raw.time_inf || '未提供';
  const credit = raw.credit || '未提供';
  const comment = raw.comment || raw.restrict || '無';

  const reply = `
**📖 課程詳細資訊**

**課程名稱：** ${course.name}
**開課序號：** ${raw.serial_number || serialNo}
**教師：** ${course.teacher}
**學年/學期：** ${year} 學年 第 ${term} 學期

**選課人數：**
一般選課：${normalCount} / ${normalLimit} ${normalCount >= normalLimit ? '🔴 已滿' : '🟢 有名額'}
授權碼：${authCount} / ${authLimit}
選課總人數：${totalCount}

**課程時間與教室：** ${timeInfo}
**學分：** ${credit}

**備註：** ${comment}
`.trim();

  await interaction.editReply(reply);
}
