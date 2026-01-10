import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("測試 bot 是否正常"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("顯示使用說明"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("查詢課程即時選課狀況")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("顯示課程詳細資訊")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("track")
    .setDescription("訂閱課程人數變化")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName("channel_id")
        .setDescription("頻道 ID（留空則私訊）")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("untrack")
    .setDescription("取消訂閱課程")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("list")
    .setDescription("列出目前訂閱的課程"),

  new SlashCommandBuilder()
    .setName("notify")
    .setDescription("設定課程通知偏好")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName("mode")
        .setDescription("通知模式")
        .setRequired(true)
        .addChoices(
          { name: "雙向通知（滿人 ↔ 未滿）", value: "both" },
          { name: "僅在有名額時通知（滿人 → 未滿）", value: "available" },
          { name: "僅在滿人時通知（未滿 → 滿人）", value: "full" }
        )
    ),

  new SlashCommandBuilder()
    .setName("botstats")
    .setDescription("顯示 Bot 運行統計資訊"),

  new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("設定課程定時報告（自動回傳選課人數）")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName("mode")
        .setDescription("報告模式")
        .setRequired(true)
        .addChoices(
          { name: "間隔模式（需填 interval）", value: "interval" },
          { name: "固定時刻（需填 days + hour + minute）", value: "cron" }
        )
    )
    .addIntegerOption(opt =>
      opt
        .setName("interval")
        .setDescription("【間隔模式】報告間隔（分鐘）")
        .setRequired(false)
        .setMinValue(5)
        .setMaxValue(1440)
    )
    .addStringOption(opt =>
      opt
        .setName("days")
        .setDescription("【固定時刻】星期幾報告，格式：1,3,5 或 0-6（0=日 1=一 2=二 3=三 4=四 5=五 6=六）")
        .setRequired(false)
    )
    .addIntegerOption(opt =>
      opt
        .setName("hour")
        .setDescription("【固定時刻】報告時間：小時（0-23）")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(23)
    )
    .addIntegerOption(opt =>
      opt
        .setName("minute")
        .setDescription("【固定時刻】報告時間：分鐘（0-59）")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addStringOption(opt =>
      opt
        .setName("channel_id")
        .setDescription("頻道 ID（留空則私訊）")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("unschedule")
    .setDescription("取消課程定時報告")
    .addStringOption(opt =>
      opt
        .setName("serial_no")
        .setDescription("開課序號，例如 1001")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("year")
        .setDescription("學年度，例如 114")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("term")
        .setDescription("學期（1 / 2 / 3）")
        .setRequired(true)
    )
];
