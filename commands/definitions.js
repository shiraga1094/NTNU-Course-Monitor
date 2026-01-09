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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
    .addIntegerOption(opt =>
      opt
        .setName("interval")
        .setDescription("報告間隔（分鐘），預設 60 分鐘")
        .setRequired(false)
        .setMinValue(5)
        .setMaxValue(1440)
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
        .setName("course_code")
        .setDescription("課程代碼，例如 AEU0049")
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
