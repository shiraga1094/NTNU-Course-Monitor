import { fetchOneCourse } from "../services/fetchOneCourse.js";
import { updateTmp } from "../utils/storage.js";

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const serialNo = interaction.options.getString("serial_no");
  const year = interaction.options.getInteger("year");
  const term = interaction.options.getInteger("term");
  const key = `${serialNo}-${year}-${term}`;

  const course = await fetchOneCourse({ serialNo, year, term });
  if (!course || !course.raw) {
    await interaction.editReply("找不到該課程資訊");
    return;
  }

  updateTmp(key, course.raw);

  const raw = course.raw;
  const X = Number(raw.counter_exceptAuth);
  const Y = Number(raw.authorize_using);

  const normalCount = X;  // 一般選課人數 = counter_exceptAuth
  const normalLimit = Number(raw.limit_count_h);
  const authUsed = Y <= 0 ? 0 : Y;  // 授權碼使用數，<= 0 時為 0
  const authCount = authUsed;
  const authLimit = Number(raw.authorize_p);
  const totalCount = Number(raw.counter);  // 選課總人數 = counter

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
